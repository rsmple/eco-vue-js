import {type Ref, inject, onBeforeUnmount, onMounted, ref} from 'vue'

import {isClientSide} from '@/utils/utils'

import {wScrollingElement} from '../models/injection'

export const useInfiniteListHeader = (headerElementHeight: Ref<number>, initIsIntersecting = true) => {
  const indicator = ref<HTMLDivElement>()
  const header = ref<HTMLDivElement>()
  const headerHeight = ref<number>(0)
  const headerTop = ref<number>(0)
  const isIntersecting = ref(initIsIntersecting)
  let observer: IntersectionObserver | null = null

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
    headerTop.value = rect.top + (scrollingElement?.value?.scrollTop ?? document.scrollingElement?.scrollTop ?? 0) - headerElementHeight.value
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
    updateHeader,
  }
}
