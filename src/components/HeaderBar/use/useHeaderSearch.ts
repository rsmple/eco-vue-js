import {type VNode, ref} from 'vue'

const search = ref<VNode[] | undefined>(undefined)

export const useHeaderSearch = () => {
  const updateHeaderSearch = (value: VNode[] | undefined) => {
    search.value = value
  }

  return {
    search,
    updateHeaderSearch,
  }
}
