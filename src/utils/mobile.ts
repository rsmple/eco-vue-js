import {readonly, ref} from 'vue'

import {debounce, isClientSide} from './utils'

export const getIsMobile = (): boolean => {
  return isClientSide && window.innerWidth < 640
}

export const getIsTablet = (): boolean => {
  return isClientSide && window.innerWidth < 1280
}

const isMobile = ref(getIsMobile())
const isTablet = ref(getIsTablet())

export const useIsMobile = () => {
  return {
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
  }
}

export const getIsTouchDevice = (): boolean => {
  return isClientSide && ('ontouchstart' in window) || navigator.maxTouchPoints > 0
}

if (isClientSide) {
  const listener = debounce(() => {
    isMobile.value = getIsMobile()
    isTablet.value = getIsTablet()
  }, 50)

  window.addEventListener('resize', listener)
}
