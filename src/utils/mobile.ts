import {computed, onMounted, ref} from 'vue'

import {debounce, getIsClientSide} from './utils'

export const getIsMobile = (): boolean => {
  return getIsClientSide() && window.innerWidth < 641
}

export const getIsTablet = (): boolean => {
  return getIsClientSide() && window.innerWidth < 1281
}

const isMobileGlobal = ref(false)
const isTabletGlobal = ref(false)

const sync = () => {
  isMobileGlobal.value = getIsMobile()
  isTabletGlobal.value = getIsTablet()
}

let synced = false

export const useIsMobile = () => {
  const mounted = ref(false)

  if (getIsClientSide()) {
    onMounted(() => {
      mounted.value = true
      if (!synced) {
        synced = true
        sync()
      }
    })
  }

  return {
    isMobile: computed(() => mounted.value && isMobileGlobal.value),
    isTablet: computed(() => mounted.value && isTabletGlobal.value),
  }
}

let isTouchDeviceInit: boolean | null = null

export const setIsTouchDeviceInit = (value: boolean | null): void => {
  isTouchDeviceInit = value
}

export const getIsTouchDevice = (): boolean => {
  return isTouchDeviceInit ?? (getIsClientSide() ? ('ontouchstart' in window) || navigator.maxTouchPoints > 0 : false)
}

if (getIsClientSide()) {
  const listener = debounce(sync, 50)

  window.addEventListener('resize', listener)
}
