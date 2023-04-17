import {onBeforeUnmount, onMounted, ref, watch, type Ref} from 'vue'

const headerElementHeight = 128

const observerOptions = {
  root: null,
  rootMargin: `-${ headerElementHeight }px 100% 0px 0px`,
  threshold: 1.0,
}

export const useInfiniteListHeader = (headerMargin: Ref<number>, updageHeaderPadding: (value: number) => void) => {
  const indicator = ref<HTMLDivElement>()
  const header = ref<HTMLDivElement>()
  const headerHeight = ref<number>(0)
  const headerTop = ref<number>(0)
  const isIntersecting = ref(true)
  let observer: IntersectionObserver | null = null

  const observerCb = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.target === indicator.value) {
        isIntersecting.value = entry.isIntersecting || entry.boundingClientRect.top > window.innerHeight
      }
    })
  }

  watch(isIntersecting, value => {
    if (!value && headerHeight.value) {
      updageHeaderPadding(headerHeight.value - headerMargin.value)
    } else {
      updageHeaderPadding(0)
    }
  })

  onMounted(() => {
    if (header.value) {
      const rect = header.value.getBoundingClientRect()
      headerHeight.value = rect.height
      headerTop.value = rect.top - headerElementHeight
    }

    if (indicator.value) {
      observer = new IntersectionObserver(observerCb, observerOptions)

      observer.observe(indicator.value)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    updageHeaderPadding(0)
  })

  return {
    indicator,
    header,
    headerHeight,
    headerTop,
    isIntersecting,
  }
}
