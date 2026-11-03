import {type Ref, computed, onBeforeUnmount, onMounted, provide, ref} from 'vue'

import {getIsClientSide} from '@/utils/utils'

import {wSectionHeadHeight} from '../models/injection'

/**
 * A section head (`surface-section-head`) sticks to the top of the page over a page list in the content after it, and
 * the list's header sticks under it. Gives that content the head's height, as `--w-section-head-height` (`style`) and to
 * the lists in it.
 */
export const useSectionHead = (headRef: Readonly<Ref<HTMLElement | null>>, getEnabled: () => boolean) => {
  const height = ref(0)

  const heightProvided = computed(() => getEnabled() ? height.value : 0)

  provide(wSectionHeadHeight, heightProvided)

  const style = computed(() => heightProvided.value ? {'--w-section-head-height': heightProvided.value + 'px'} : undefined)

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!getIsClientSide() || !headRef.value) return

    resizeObserver = new ResizeObserver(() => {
      if (headRef.value) height.value = headRef.value.offsetHeight
    })
    resizeObserver.observe(headRef.value)
  })

  onBeforeUnmount(() => resizeObserver?.disconnect())

  return {style}
}
