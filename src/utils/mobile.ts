
export const getIsMobile = (): boolean => {
  return window.innerWidth < 640
}

export const getIsTouchDevice = (): boolean => {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0
}
