
const TRIGGER_FACTOR = 200

export const getIsScrollUp = (element: Element | null): boolean => {
  if (!element) return false

  return element.scrollTop < TRIGGER_FACTOR
}

export const getIsScrollDown = (element: Element | null): boolean => {
  if (!element) return false

  return element.scrollTop > (element.scrollHeight - element.clientHeight) - TRIGGER_FACTOR
}
