import {ref} from 'vue'

const isBackdrop = ref(false)

export const useIsBackdrop = () => {
  return isBackdrop
}