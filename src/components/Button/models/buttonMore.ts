import {ref} from 'vue'

const current = ref<string | undefined>()

export const useButtonMoreId = () => {
  return {
    current,
  }
}
