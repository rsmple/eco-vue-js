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
