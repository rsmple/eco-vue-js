import {isClientSide} from './utils'

export const getIsMobile = (): boolean => {
  return isClientSide && window.innerWidth < 640
}

export const getIsTouchDevice = (): boolean => {
  return isClientSide && ('ontouchstart' in window) || navigator.maxTouchPoints > 0
}
