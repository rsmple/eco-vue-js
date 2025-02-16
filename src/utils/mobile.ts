import {ref} from 'vue'

import {debounce, isClientSide} from './utils'

export const getIsMobile = (): boolean => {
  return isClientSide && window.innerWidth < 640
}

const isMobile = ref(getIsMobile())

export const useIsMobile = () => {
  return {
    isMobile,
  }
}

export const getIsTouchDevice = (): boolean => {
  return isClientSide && ('ontouchstart' in window) || navigator.maxTouchPoints > 0
}

if (isClientSide) {
  const listener = debounce(() => {
    isMobile.value = getIsMobile()
  }, 50)

  window.addEventListener('resize', listener)
}
