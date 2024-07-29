import {inject} from 'vue'
import {wTabItemListener} from '../models/injection'

export const useIsInsideTab = () => {
  const tabItemListenerInjected = inject(wTabItemListener, null)

  return {
    isInsideTab: tabItemListenerInjected !== null,
  }
}
