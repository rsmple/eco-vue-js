import {type Ref, computed, onBeforeUnmount, onMounted, provide, ref} from 'vue'

import {getIsClientSide} from '@/utils/utils'

import {wSectionHeadHeight} from '../models/injection'

/**
 * A section head (`surface-section-head`) sticks to the top of the page over a page list in the content after it, and
 * the list's header sticks under it. Gives that content the head's height, as `--w-section-head-height` (`style`) and to
 * the lists in it, and tells when the head is stuck: the canvas above it is then covered, as the list's header covers
 * it above itself.
 */
export const useSectionHead = (headRef: Readonly<Ref<HTMLElement | null>>, getEnabled: () => boolean) => {
  const height = ref(0)
  const isStuck = ref(false)

  const heightProvided = computed(() => getEnabled() ? height.value : 0)

  provide(wSectionHeadHeight, heightProvided)

  const style = computed(() => heightProvided.value ? {'--w-section-head-height': heightProvided.value + 'px'} : undefined)

  let resizeObserver: ResizeObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let observerTop: number | null = null

  // Where the head sticks, or null while it does not: it does only over a page list.
  const getStickyTop = (element: HTMLElement): number | null => {
    const computedStyle = getComputedStyle(element)
    if (computedStyle.position !== 'sticky') return null

    const top = parseFloat(computedStyle.top)

    return Number.isNaN(top) ? null : top
  }

  const observe = () => {
    const element = headRef.value
    if (!element || !getEnabled()) return

    const top = getStickyTop(element)

    if (top === null) {
      intersectionObserver?.disconnect()
      intersectionObserver = null
      observerTop = null
      isStuck.value = false
      return
    }

    if (intersectionObserver && top === observerTop) return

    intersectionObserver?.disconnect()
    observerTop = top

    // A pixel below where it sticks: stuck, it is cut by that pixel. Below the screen it is cut too, but not stuck.
    intersectionObserver = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1]
      if (!entry) return

      isStuck.value = entry.intersectionRatio < 1 && entry.boundingClientRect.top <= top + 1
    }, {
      root: null,
      rootMargin: `-${ top + 1 }px 0px 100000px 0px`,
      threshold: 1,
    })

    intersectionObserver.observe(element)
  }

  const update = () => {
    const element = headRef.value
    if (!element || !getEnabled()) return

    height.value = element.offsetHeight
    observe()
  }

  onMounted(() => {
    if (!getIsClientSide() || !headRef.value) return

    update()

    resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(headRef.value)
    window.addEventListener('resize', observe)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', observe)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
  })

  return {
    style,
    isStuck,
    observe,
  }
}
