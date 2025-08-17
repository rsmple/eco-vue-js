import {type InjectionKey, type Ref, onBeforeUnmount, provide, ref} from 'vue'

export const wFieldSaved = Symbol('wFieldSaved') as InjectionKey<Ref<boolean>>

export const useFieldSaved = () => {
  const saved = ref(false)

  provide(wFieldSaved, saved)

  let timeout: NodeJS.Timeout | null = null

  const resetSaved = () => {
    saved.value = false

    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const showSaved = () => {
    if (timeout) clearTimeout(timeout)

    if (saved.value) {
      saved.value = false

      timeout = setTimeout(showSaved, 100)
    } else {
      saved.value = true

      timeout = setTimeout(resetSaved, 2000)
    }
  }

  onBeforeUnmount(resetSaved)

  return {showSaved}
}
