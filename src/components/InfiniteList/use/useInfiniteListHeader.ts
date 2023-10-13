import {onBeforeUnmount, onMounted, ref} from 'vue'

const headerElementHeight = 60

const observerOptions = {
  root: null,
  rootMargin: `-${ headerElementHeight }px 100% 0px 0px`,
  threshold: 1.0,
}

export const useInfiniteListHeader = (scrollingElement: Element | null = document.scrollingElement) => {
  const indicator = ref<HTMLDivElement>()
  const header = ref<HTMLDivElement>()
  const headerHeight = ref<number>(0)
  const headerTop = ref<number>(0)
  const isIntersecting = ref(true)
  let observer: IntersectionObserver | null = null
  let isFirst = true

  const observerCb = (entries: IntersectionObserverEntry[]) => {
    if (isFirst) {
      isFirst = false
      return
    }

    isIntersecting.value = entries.some(entry => {
      if (entry.target === indicator.value) {
        return entry.isIntersecting || entry.boundingClientRect.top > window.innerHeight
      }
    })
  }

  onMounted(() => {
    if (header.value) {
      const rect = header.value.getBoundingClientRect()
      headerHeight.value = rect.height
      headerTop.value = rect.top + (scrollingElement?.scrollTop ?? 0) - headerElementHeight
    }

    if (indicator.value) {
      observer = new IntersectionObserver(observerCb, observerOptions)

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
  }
}
