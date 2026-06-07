import {type VNode, ref} from 'vue'

const filter = ref<VNode[] | undefined>(undefined)
const count = ref(0)

export const useActionBarFilter = () => {
  const updateFilter = (value: VNode[] | undefined) => {
    filter.value = value
  }

  const updateCount = (value: number) => {
    count.value = value
  }

  return {
    filter,
    count,
    updateFilter,
    updateCount,
  }
}
