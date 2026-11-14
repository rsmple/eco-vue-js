const TRIGGER_FACTOR = 200

/**
 * Marks an element rendered with an item that the list leaves out of the size it guesses for the pages not rendered,
 * such as the content of an opened row: it is open on one item only, and counted it would grow every page.
 */
export const INFINITE_LIST_UNMEASURED_ATTRIBUTE = 'data-w-infinite-list-unmeasured'

export const getIsScrollUp = (element: Element | null, offsetTop: number): boolean => {
  if (!element) return false

  return (element.scrollTop - offsetTop) < TRIGGER_FACTOR
}

export const getIsScrollDown = (element: Element | null): boolean => {
  if (!element) return false

  return element.scrollTop > (element.scrollHeight - element.clientHeight) - TRIGGER_FACTOR
}

export const getIsDocumentScroll = (element: Element): boolean => element === document.scrollingElement || element === document.body || element === document.documentElement

/** The columns of a grid, as its computed columns are the resolved track sizes, one length per column; 1 for any other box. */
export const getGridColumnCount = (style: CSSStyleDeclaration): number => {
  if (style.display !== 'grid' && style.display !== 'inline-grid') return 1

  return Math.max(style.gridTemplateColumns.match(/[\d.]+px/g)?.length ?? 1, 1)
}
