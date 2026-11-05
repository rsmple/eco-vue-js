<template>
  <!-- A page list joined to a frame, such as in WTabs `section`: its header goes to the frame's stuck header. -->
  <template v-if="joined">
    <Teleport
      v-if="joined.target.value"
      :to="joined.target.value"
    >
      <slot
        name="header"
        v-bind="joined.scope"
      />
    </Teleport>

    <slot v-bind="joined.scope" />
  </template>

  <template v-else>
    <div
      ref="indicator"
      class="print:hidden"
    />

    <div
      ref="header"
      class="print:hidden"
      :class="inPlace ? undefined : {
        'sticky': true,
        'top-(--w-header-inner)': !isContained,
        'w-infinite-list-header': !isContained && !noHeaderUpdate,
        'w-infinite-list-header-stuck': !isContained && !noHeaderUpdate && isIntersecting === false,
        'top-0 not-empty:pt-(--w-list-contained-top,0.75rem)': isContained && !isModal,
        'top---modal-header-height': isModal,
        'bg-surface': noHeaderUpdate || isContained,
      }"
      :style="inPlace ? undefined : {zIndex: isIntersecting ? BASE_ZINDEX_DROPDOWN : BASE_ZINDEX_LIST_HEADER}"
    >
      <div
        v-if="!inPlace && !isContained && !noHeaderUpdate"
        class="w-infinite-list-header-edge"
        :style="{'--w-list-header-height': headerHeight + 'px'}"
      />

      <slot
        name="header"
        v-bind="{headerTop, headerHeight, stickyTop, updateHeader}"
      />
    </div>

    <slot v-bind="{headerTop, headerHeight, stickyTop, updateHeader}" />
  </template>
</template>

<script lang="ts" setup>
import type {InfiniteListHeaderScope} from './types'

import {type VNode, inject, onBeforeUnmount, onMounted, provide, ref, useTemplateRef, watch} from 'vue'

import {wListPageFrameHeader} from '@/components/List/models/injection'
import {wIsModal, wModalHeaderHeight} from '@/components/Modal/models/injection'
import {BASE_ZINDEX_DROPDOWN, BASE_ZINDEX_LIST_HEADER, getIsClientSide, getScrollParent} from '@/utils/utils'

import {wScrollingElement} from './models/injection'

import {useHeader} from '../HeaderBar/use/useHeader'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  /** Whether the top of the content starts in view, before the first scroll is observed. `false` when opening at a later page. */
  initIsIntersecting?: boolean
  /** Keeps the sticky header out of the app header bar's padding while scrolled. */
  noHeaderUpdate?: boolean
  /** Renders the header in place over the content: it neither sticks nor pads the app header bar. */
  inPlace?: boolean
}>()

const isModal = inject(wIsModal, false)
const modalHeaderHeight = inject(wModalHeaderHeight, undefined)
const scrollingElement = inject(wScrollingElement, null)

// Inside its own scroll container (a modal, or any WInfiniteListScrollingElement) the header sticks to that
// container: it has its own background and leaves the page header alone. Outside a modal nothing sits above it,
// so it keeps its own gap from the container's top edge: `--w-list-contained-top`, for a container whose padding it
// should match.
const isContained = isModal || scrollingElement !== null

const joined = isContained ? null : inject(wListPageFrameHeader, null)

// A list in the content is not the one joined to the frame.
provide(wListPageFrameHeader, null)

const {headerHeight: headerHeightLayout, updateHeaderPadding} = useHeader()

const indicatorRef = useTemplateRef('indicator')
const headerRef = useTemplateRef('header')

const headerHeight = ref(0)
const headerTop = ref(0)
const stickyTop = ref(0)

// null until the observer reports, so the header padding is not applied before the real position is known
const isIntersecting = ref<boolean | null>(props.initIsIntersecting ?? null)

/** The header's sticky top on the page, which counts the gaps a theme keeps above it, not just the header bar. */
const getPageStickyTop = (): number => {
  const top = headerRef.value ? parseFloat(getComputedStyle(headerRef.value).top) : NaN

  return Number.isNaN(top) ? headerHeightLayout.value : top
}

// What the header sticks under: the modal's title bar, nothing in another scroll container, or on the page its sticky top.
const getTopOffset = (): number => {
  if (modalHeaderHeight) return modalHeaderHeight.value
  if (scrollingElement) return 0

  return getPageStickyTop()
}

const updateHeaderTop = () => {
  if (!headerRef.value) return

  stickyTop.value = getTopOffset()

  const rect = headerRef.value.getBoundingClientRect()
  headerTop.value = rect.top + (scrollingElement?.value?.scrollTop ?? document.scrollingElement?.scrollTop ?? 0) - stickyTop.value
}

const updateHeader = () => {
  if (!headerRef.value) return

  headerHeight.value = headerRef.value.getBoundingClientRect().height
  updateHeaderTop()
}

// In another scroll container the page header has no part in where the header sticks.
watch(() => modalHeaderHeight?.value ?? (scrollingElement ? 0 : headerHeightLayout.value), updateHeaderTop)

// The header bar grows behind the stuck header by its height, and outside a page list by the gap above it too: a page
// list's stuck header covers the gap itself.
const stickyGap = ref(0)

const isPadding = () => !joined && !isContained && !props.noHeaderUpdate

const updatePadding = () => {
  if (!isPadding()) return

  const intersecting = props.inPlace || isIntersecting.value
  if (intersecting === null) return

  const offset = indicatorRef.value?.closest('.w-list-page') ? 0 : stickyGap.value
  const height = headerHeight.value + offset

  updateHeaderPadding(!intersecting && height ? height : 0)
}

watch(() => [props.inPlace, isIntersecting.value, headerHeight.value, stickyGap.value], updatePadding)

watch(() => props.noHeaderUpdate, value => {
  if (value && !joined && !isContained) updateHeaderPadding(0)
})

const observerCb = (entries: IntersectionObserverEntry[]) => {
  isIntersecting.value = entries.some(entry => {
    if (entry.target === indicatorRef.value) {
      return entry.isIntersecting || entry.boundingClientRect.top > window.innerHeight
    }
  })
}

let intersectionObserver: IntersectionObserver | null = null
let intersectionObserverTop: number | null = null

const observe = () => {
  if (!indicatorRef.value) return

  const top = isContained ? headerHeightLayout.value : getPageStickyTop()
  stickyGap.value = isContained ? 0 : Math.max(0, top - headerHeightLayout.value)
  if (intersectionObserver && top === intersectionObserverTop) return

  intersectionObserver?.disconnect()
  intersectionObserverTop = top

  // Reaches far below the screen: a jump from below it to past the top is still a change the observer reports.
  intersectionObserver = new IntersectionObserver(observerCb, {
    root: null,
    rootMargin: `-${ top }px 100% 100000px 0px`,
    threshold: 1.0,
  })

  intersectionObserver.observe(indicatorRef.value)
}

// The sticky top changes with the screen size, such as a gap that is smaller on phones.
const onResize = () => {
  updateHeaderTop()
  observe()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!getIsClientSide() || joined || !headerRef.value) return

  resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return

    headerHeight.value = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
    updateHeaderTop()
  })

  resizeObserver.observe(headerRef.value)

  observe()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()

  if (isPadding()) updateHeaderPadding(0)
})

/**
 * While the header is stuck, scrolls back to where it stops sticking, such as before other content opens under it. The
 * indicator stays where the header is in the flow, so how far it is above the stuck header is how far the content is scrolled.
 */
const resetScroll = () => {
  if (!indicatorRef.value || !headerRef.value) return

  const delta = indicatorRef.value.getBoundingClientRect().top - headerRef.value.getBoundingClientRect().top

  if (delta < 0) (scrollingElement?.value ?? getScrollParent(indicatorRef.value) ?? document.scrollingElement)?.scrollBy({top: delta, behavior: 'instant'})
}

defineExpose({
  resetScroll,
})

defineSlots<{
  /** Content that sticks to the top while the page scrolls. `updateHeader` re-measures it right away. */
  header: (props: InfiniteListHeaderScope) => VNode[]
  /** The scrolling content. Gets the header's `headerHeight` and `headerTop`. */
  default: (props: InfiniteListHeaderScope) => VNode[]
}>()
</script>
