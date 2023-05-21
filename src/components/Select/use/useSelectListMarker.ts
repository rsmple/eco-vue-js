import {onBeforeUnmount, onMounted, ref} from 'vue'

const observerOptions = {
  root: null,
  rootMargin: '0px 100% 0px 0px',
  threshold: 1.0,
}

export const useSelectListMarker = () => {
  const indicator = ref<HTMLDivElement>()
  const isIntersecting = ref(true)
  let observer: IntersectionObserver | null = null

  const observerCb = (entries: IntersectionObserverEntry[]) => {
    isIntersecting.value = entries.some(entry => {
      if (entry.target === indicator.value) {
        return entry.isIntersecting || entry.boundingClientRect.top > window.innerHeight
      }
    })
  }

  onMounted(() => {
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
    isIntersecting,
  }
}
