import {ref} from 'vue'

const visible = ref(false)

export const useHeaderSearchVisible = () => {
  const updateVisible = (value: boolean) => {
    visible.value = value
  }

  return {
    visible,
    updateVisible,
  }
}
