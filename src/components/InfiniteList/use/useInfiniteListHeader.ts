import {type Ref, inject, ref} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {wModalHeaderHeight} from '@/components/Modal/models/injection'

import {wScrollingElement} from '../models/injection'

export const useInfiniteListHeader = (isIntersecting: Ref<boolean>) => {
  const header = ref<HTMLDivElement>()
  const headerHeight = ref<number>(0)
  const headerTop = ref<number>(0)

  const {updateHeaderPadding, headerHeight: headerElementHeight} = useHeader()

  const modalHeaderHeight = inject(wModalHeaderHeight, undefined)

  const scrollingElement = inject(wScrollingElement, null)

  const updateHeader = () => {
    if (!header.value) return

    const rect = header.value.getBoundingClientRect()
    headerHeight.value = rect.height
    headerTop.value = rect.top + (scrollingElement?.value?.scrollTop ?? document.scrollingElement?.scrollTop ?? 0) - (modalHeaderHeight ?? headerElementHeight.value)
  }

  const updateHeaderHeight = () => {
    if (!isIntersecting.value && headerHeight.value) {
      updateHeader()

      updateHeaderPadding(headerHeight.value)
    } else {
      updateHeaderPadding(0)
    }
  }

  return {
    header,
    headerHeight,
    headerTop,
    updateHeader,
    updateHeaderPadding,
    updateHeaderHeight,
  }
}
