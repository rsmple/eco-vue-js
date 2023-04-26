import {onUnmounted, provide, ref} from 'vue'
import {wTabItemListener, wTabItemUnlistener} from '../models/injection'

export const useTabItemActiveListener = () => {
  const listeners = ref<(() => void)[]>([])

  const addListener = (value: () => void): void => {
    listeners.value.push(value)
  }

  provide(wTabItemListener, addListener)

  const titleMapUnlistener = (value: () => void) => {
    const index = listeners.value.indexOf(value)

    if (index === -1) return

    listeners.value.splice(index, 1)
  }

  provide(wTabItemUnlistener, titleMapUnlistener)

  const callListeners = () => {
    listeners.value.forEach(cb => cb())
  }

  onUnmounted(() => {
    listeners.value = []
  })

  return {
    callListeners,
  }
}