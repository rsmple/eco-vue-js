import {ref} from 'vue'

const headerPadding = ref(0)

export const useHeaderPadding = () => {
  const updateHeaderPadding = (value: number) => {
    headerPadding.value = value
  }

  return {
    headerPadding,
    updateHeaderPadding,
  }
}
