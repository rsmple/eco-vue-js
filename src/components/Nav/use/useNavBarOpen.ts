import {readonly, ref} from 'vue'

const isOpen = ref(false)

export const useNavBarOpen = () => {
  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen: readonly(isOpen),
    toggle,
    close,
  }
}
