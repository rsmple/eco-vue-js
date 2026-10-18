<template>
  <div
    ref="header"
    v-bind.attr="$attrs"
  >
    <slot
      name="header"
      v-bind="{headerTop, headerHeight, stickyTop, updateHeader}"
    />
  </div>

  <slot v-bind="{headerTop, headerHeight, stickyTop, updateHeader}" />
</template>

<script lang="ts" setup>
import type {InfiniteListHeaderScope} from '../types'

import {type VNode, inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {wModalHeaderHeight} from '@/components/Modal/models/injection'
import {getIsClientSide} from '@/utils/utils'

import {wScrollingElement} from '../models/injection'

defineProps<{
  isIntersecting: boolean | null
}>()

const headerRef = useTemplateRef('header')
const headerHeight = ref<number>(0)
const headerTop = ref<number>(0)
const stickyTop = ref<number>(0)

const {headerHeight: headerHeightLayout} = useHeader()

const modalHeaderHeight = inject(wModalHeaderHeight, undefined)

const scrollingElement = inject(wScrollingElement, null)

// What the header sticks under: the modal's title bar, nothing in another scroll container, or on the page its sticky
// top, which counts the gaps a theme keeps above it, not just the header bar.
const getTopOffset = () => {
  if (modalHeaderHeight) return modalHeaderHeight.value
  if (scrollingElement) return 0

  const top = headerRef.value ? parseFloat(getComputedStyle(headerRef.value).top) : NaN

  return Number.isNaN(top) ? headerHeightLayout.value : top
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

let observer: ResizeObserver | null = null

onMounted(() => {
  if (!getIsClientSide() || !headerRef.value) return

  observer = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return

    headerHeight.value = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
    updateHeaderTop()
  })

  observer.observe(headerRef.value)

  // The sticky top changes with the screen size, such as a gap that is smaller on phones.
  window.addEventListener('resize', updateHeaderTop)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHeaderTop)
  observer?.disconnect()
  observer = null
})

watch(() => modalHeaderHeight?.value ?? headerHeightLayout.value, updateHeaderTop)

defineSlots<{
  header: (props: InfiniteListHeaderScope) => VNode[]
  default: (props: InfiniteListHeaderScope) => VNode[]
}>()
</script>
