<template>
  <div
    ref="indicator"
    class="print:hidden"
  />

  <InfiniteListHeaderHeight
    :is-intersecting="isIntersecting"
    class="sticky print:hidden"
    :class="{
      'top-(--w-header-inner)': !isContained,
      'w-infinite-list-header': !isContained && !noHeaderUpdate,
      'w-infinite-list-header-stuck': !isContained && !noHeaderUpdate && isIntersecting === false,
      'top-0 not-empty:pt-3': isContained && !isModal,
      'top---modal-header-height': isModal,
      'bg-surface': noHeaderUpdate || isContained,
    }"
    :style="{zIndex: isIntersecting ? BASE_ZINDEX_DROPDOWN : BASE_ZINDEX_LIST_HEADER}"
  >
    <template
      v-if="isContained || noHeaderUpdate"
      #header="scope"
    >
      <slot
        name="header"
        v-bind="scope"
      />
    </template>

    <template
      v-else
      #header="scope"
    >
      <div
        class="w-infinite-list-header-edge"
        :style="{'--w-list-header-height': scope.headerHeight + 'px'}"
      />

      <InfiniteListHeaderPadding
        :is-intersecting="isIntersecting"
        :header-height="scope.headerHeight"
      >
        <slot
          name="header"
          v-bind="scope"
        />
      </InfiniteListHeaderPadding>
    </template>

    <template #default="scope">
      <slot v-bind="scope" />
    </template>
  </InfiniteListHeaderHeight>
</template>

<script lang="ts" setup>
import type {InfiniteListHeaderScope} from './types'

import {type VNode, inject, onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

import {wIsModal} from '@/components/Modal/models/injection'
import {BASE_ZINDEX_DROPDOWN, BASE_ZINDEX_LIST_HEADER, getIsClientSide} from '@/utils/utils'

import InfiniteListHeaderHeight from './components/InfiniteListHeaderHeight.vue'
import InfiniteListHeaderPadding from './components/InfiniteListHeaderPadding.vue'
import {wScrollingElement} from './models/injection'

import {useHeader} from '../HeaderBar/use/useHeader'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  /** Whether the top of the content starts in view, before the first scroll is observed. `false` when opening at a later page. */
  initIsIntersecting?: boolean
  /** Keeps the sticky header out of the app header bar's padding while scrolled. */
  noHeaderUpdate?: boolean
}>()

const isModal = inject(wIsModal, false)

// Inside its own scroll container (a modal, or any WInfiniteListScrollingElement) the header sticks to that
// container: it has its own background and leaves the page header alone. Outside a modal nothing sits above it,
// so it keeps its own gap from the container's top edge.
const isContained = isModal || inject(wScrollingElement, null) !== null

// null until the observer reports, so the header padding is not applied before the real position is known
const isIntersecting = ref<boolean | null>(props.initIsIntersecting ?? null)
const indicatorRef = useTemplateRef('indicator')

const observerCb = (entries: IntersectionObserverEntry[]) => {
  isIntersecting.value = entries.some(entry => {
    if (entry.target === indicatorRef.value) {
      return entry.isIntersecting || entry.boundingClientRect.top > window.innerHeight
    }
  })
}

let observer: IntersectionObserver | null = null

let observerTop: number | null = null

const {headerHeight} = useHeader()

// Where the header sticks: the gap and padding a theme keeps above it count, not just the header bar.
const getStickyTop = (): number => {
  const header = isContained ? null : indicatorRef.value?.nextElementSibling
  const top = header ? parseFloat(getComputedStyle(header).top) : NaN

  return Number.isNaN(top) ? headerHeight.value : top
}

const observe = () => {
  if (!indicatorRef.value) return

  const top = getStickyTop()
  if (observer && top === observerTop) return

  observer?.disconnect()
  observerTop = top

  // Reaches far below the screen: a jump from below it to past the top is still a change the observer reports.
  observer = new IntersectionObserver(observerCb, {
    root: null,
    rootMargin: `-${ top }px 100% 100000px 0px`,
    threshold: 1.0,
  })

  observer.observe(indicatorRef.value)
}

onMounted(() => {
  if (!getIsClientSide()) return

  observe()
  window.addEventListener('resize', observe)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', observe)
  observer?.disconnect()
})

defineSlots<{
  /** Content that sticks to the top while the page scrolls. `updateHeader` re-measures it right away. */
  header: (props: InfiniteListHeaderScope) => VNode[]
  /** The scrolling content. Gets the header's `headerHeight` and `headerTop`. */
  default: (props: InfiniteListHeaderScope) => VNode[]
}>()
</script>
