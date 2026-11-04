import {type MaybeRefOrGetter, onBeforeUnmount, toValue, watch} from 'vue'

export type StickyPathAttribute = 'data-w-page-path' | 'data-w-modal-path'

type MarkAttribute = StickyPathAttribute | 'data-w-page-table'

const countMap: Record<MarkAttribute, WeakMap<Element, number>> = {
  'data-w-page-path': new WeakMap(),
  'data-w-modal-path': new WeakMap(),
  'data-w-page-table': new WeakMap(),
}

const mark = (element: Element, attribute: MarkAttribute) => {
  const count = countMap[attribute].get(element) ?? 0

  countMap[attribute].set(element, count + 1)

  if (count === 0) element.setAttribute(attribute, '')
}

const unmark = (element: Element, attribute: MarkAttribute) => {
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

/**
 * Marks the document's root (`data-w-page-table`) while a table on the page is mounted, so the sections and the
 * content across the page stick while it scrolls sideways (surfaces.css). Not a `:root:has()`: that makes every node
 * added anywhere, each cell of a new page of rows, check the root again.
 */
export const usePageTableMark = (element: MaybeRefOrGetter<Element | null | undefined>, active: MaybeRefOrGetter<boolean>) => {
  let marked: Element | null = null

  const clear = () => {
    if (!marked) return

    unmark(marked, 'data-w-page-table')

    marked = null
  }

  watch(() => toValue(active) ? toValue(element)?.ownerDocument.documentElement : undefined, root => {
    clear()

    if (!root) return

    mark(root, 'data-w-page-table')

    marked = root
  }, {flush: 'post', immediate: true})

  onBeforeUnmount(clear)
}
