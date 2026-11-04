import {computed, onBeforeUnmount, ref} from 'vue'

// One group's dropdown is open at a time, so moving between groups switches it in place rather than stacking menus.
const openKey = ref<symbol | null>(null)

let timeout: ReturnType<typeof setTimeout> | null = null

const clearHide = () => {
  if (timeout === null) return

  clearTimeout(timeout)
  timeout = null
}

export const useNavGroupDropdown = () => {
  const key = Symbol('nav-group')

  const isOpen = computed(() => openKey.value === key)

  const show = () => {
    clearHide()

    openKey.value = key
  }

  // Waits a moment, so the pointer can cross the gap from the item to its dropdown.
  const hide = () => {
    if (!isOpen.value) return

    clearHide()

    timeout = setTimeout(() => {
      timeout = null

      if (openKey.value === key) openKey.value = null
    }, 20)
  }

  const close = () => {
    if (!isOpen.value) return

    clearHide()

    openKey.value = null
  }

  onBeforeUnmount(close)

  return {
    isOpen,
    show,
    hide,
    close,
  }
}
