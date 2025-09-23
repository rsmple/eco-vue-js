import {readonly, ref} from 'vue'

import {debounce, getIsClientSide} from './utils'

export const getIsMobile = (): boolean => {
  return getIsClientSide() && window.innerWidth < 640
}

export const getIsTablet = (): boolean => {
  return getIsClientSide() && window.innerWidth < 1280
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
  return getIsClientSide() && ('ontouchstart' in window) || navigator.maxTouchPoints > 0
}

if (getIsClientSide()) {
  const listener = debounce(() => {
    isMobile.value = getIsMobile()
    isTablet.value = getIsTablet()
  }, 50)

  window.addEventListener('resize', listener)
}
