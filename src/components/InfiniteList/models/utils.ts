
const TRIGGER_FACTOR = 200

export const getIsScrollUp = (): boolean => {
  if (!document.scrollingElement) return false

  return document.scrollingElement.scrollTop < TRIGGER_FACTOR
}

export const getIsScrollDown = (): boolean => {
  if (!document.scrollingElement) return false

  return document.scrollingElement.scrollTop > (document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight) - TRIGGER_FACTOR
}
