// One observer for every header cell, so the widths measured together arrive in one callback and update the list
// once. With an observer per cell, each width would land in a flush of its own and re-render the list each time.
let observer: ResizeObserver | null = null
const callbacks = new Map<Element, (width: number) => void>()

const stopMeasuring = (element: Element): void => {
  callbacks.delete(element)
  observer?.unobserve(element)
}

/** Calls `callback` with the border-box width of `element` once it is laid out. Returns a function that stops waiting. */
export const measureWidthOnce = (element: Element, callback: (width: number) => void): (() => void) => {
  observer ??= new ResizeObserver(entries => {
    for (const entry of entries) {
      const entryCallback = callbacks.get(entry.target)
      if (!entryCallback) continue

      stopMeasuring(entry.target)
      entryCallback(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width)
    }
  })

  callbacks.set(element, callback)
  observer.observe(element)

  return () => stopMeasuring(element)
}
