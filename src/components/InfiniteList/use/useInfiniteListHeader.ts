import {type Ref, onBeforeUnmount, onMounted, ref} from 'vue'

import {isClientSide} from '@/utils/utils'

export const useInfiniteListHeader = (headerElementHeight: Ref<number>, scrollingElement: Element | null = document.scrollingElement, initIsIntersecting = true) => {
  const indicator = ref<HTMLDivElement>()
  const header = ref<HTMLDivElement>()
  const headerHeight = ref<number>(0)
  const headerTop = ref<number>(0)
  const isIntersecting = ref(initIsIntersecting)
  let observer: IntersectionObserver | null = null

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
    headerTop.value = rect.top + (scrollingElement?.scrollTop ?? 0) - headerElementHeight.value
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
