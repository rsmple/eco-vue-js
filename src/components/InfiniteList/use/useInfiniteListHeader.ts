import {inject, onBeforeUnmount, onMounted, ref} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {wModalHeaderHeight} from '@/components/Modal/models/injection'
import {isClientSide} from '@/utils/utils'

import {wScrollingElement} from '../models/injection'

export const useInfiniteListHeader = (initIsIntersecting = true) => {
  const indicator = ref<HTMLDivElement>()
  const header = ref<HTMLDivElement>()
  const headerHeight = ref<number>(0)
  const headerTop = ref<number>(0)
  const isIntersecting = ref(initIsIntersecting)
  let observer: IntersectionObserver | null = null

  const {updateHeaderPadding, headerHeight: headerElementHeight} = useHeader()

  const modalHeaderHeight = inject(wModalHeaderHeight, undefined)

  const scrollingElement = inject(wScrollingElement, null)

  const observerCb = (entries: IntersectionObserverEntry[]) => {
    isIntersecting.value = entries.some(entry => {
      if (entry.target === indicator.value) {
        return entry.isIntersecting || entry.boundingClientRect.top > window.innerHeight
      }
    })
  }

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

  onMounted(() => {
    if (!isClientSide) return
    
    updateHeader()

    if (indicator.value) {
      observer = new IntersectionObserver(observerCb, {
        root: null,
        rootMargin: `-${ headerElementHeight.value }px 100% 0px 0px`,
        threshold: 1.0,
      })

      observer.observe(indicator.value)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return {
    indicator,
    header,
    headerHeight,
    headerTop,
    isIntersecting,
    updateHeaderPadding,
    updateHeaderHeight,
  }
}
