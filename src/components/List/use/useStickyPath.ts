import {type MaybeRefOrGetter, onBeforeUnmount, toValue, watch} from 'vue'

export type StickyPathAttribute = 'data-w-page-path' | 'data-w-modal-path'

const countMap: Record<StickyPathAttribute, WeakMap<Element, number>> = {
  'data-w-page-path': new WeakMap(),
  'data-w-modal-path': new WeakMap(),
}

const mark = (element: Element, attribute: StickyPathAttribute) => {
  const count = countMap[attribute].get(element) ?? 0

  countMap[attribute].set(element, count + 1)

  if (count === 0) element.setAttribute(attribute, '')
}

const unmark = (element: Element, attribute: StickyPathAttribute) => {
  const count = (countMap[attribute].get(element) ?? 1) - 1

  if (count > 0) {
    countMap[attribute].set(element, count)
  } else {
    countMap[attribute].delete(element)
    element.removeAttribute(attribute)
  }
}

/**
 * Marks the boxes from a list's parent up to its closest `end` ancestor, the page or the modal, so the content beside
 * them sticks while the list scrolls sideways (surfaces.css). An attribute, not a class, so a box's own class binding
 * keeps it, and not a `:has()` over every box: that restyles the whole page whenever a page of rows renders.
 *
 * `outside` skips a list inside one: a list in a row of another, whose path the outer list marks.
 */
export const useStickyPath = (
  element: MaybeRefOrGetter<Element | null | undefined>,
  options: MaybeRefOrGetter<{attribute: StickyPathAttribute, end: string, outside?: string} | null>,
) => {
  let marked: {elements: Element[], attribute: StickyPathAttribute} | null = null

  const clear = () => {
    if (!marked) return

    for (const box of marked.elements) unmark(box, marked.attribute)

    marked = null
  }

  watch(() => [toValue(element), toValue(options)] as const, ([element, options]) => {
    clear()

    const parent = element?.parentElement
    if (!parent || !options) return

    const end = parent.closest(options.end)
    if (!end) return

    if (options.outside) {
      const outer = parent.closest(options.outside)

      if (outer && end.contains(outer)) return
    }

    const elements: Element[] = []

    for (let box: Element | null = parent; box; box = box.parentElement) {
      mark(box, options.attribute)
      elements.push(box)

      if (box === end) break
    }

    marked = {elements, attribute: options.attribute}
  }, {flush: 'post', immediate: true})

  onBeforeUnmount(clear)
}
