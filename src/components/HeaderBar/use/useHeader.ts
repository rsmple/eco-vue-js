import {ref} from 'vue'

const headerHeight = ref(0)
const headerPadding = ref(0)

export const useHeader = () => {
  const updateHeaderHeight = (value: number) => {
    headerHeight.value = value
  }

  const updateHeaderPadding = (value: number) => {
    headerPadding.value = value
  }

  return {
    headerHeight,
    headerPadding,
    updateHeaderHeight,
    updateHeaderPadding,
  }
}
