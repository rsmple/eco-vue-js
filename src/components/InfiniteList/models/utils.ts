const TRIGGER_FACTOR = 200

export const getIsScrollUp = (element: Element | null, offsetTop: number): boolean => {
  if (!element) return false

  return (element.scrollTop - offsetTop) < TRIGGER_FACTOR
}

export const getIsScrollDown = (element: Element | null): boolean => {
  if (!element) return false

  return element.scrollTop > (element.scrollHeight - element.clientHeight) - TRIGGER_FACTOR
}
