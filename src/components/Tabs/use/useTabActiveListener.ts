import {inject, onBeforeUnmount, onMounted} from 'vue'

import {wTabItemListener, wTabItemUnlistener} from '../models/injection'

export const useTabActiveListener = (listener: () => void) => {
  const tabItemListenerInjected = inject(wTabItemListener, null)
  const tabItemUnlistenerInjected = inject(wTabItemUnlistener, null)

  onMounted(() => {
    tabItemListenerInjected?.(listener)
  })

  onBeforeUnmount(() => {
    tabItemUnlistenerInjected?.(listener)
  })
}
