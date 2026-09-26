<template>
  <div
    ref="indicator"
    class="print:hidden"
  />

  <InfiniteListHeaderHeight
    :is-intersecting="isIntersecting"
    class="sticky print:hidden"
    :class="{
      'top---header-height': !isContained,
      'top-0 not-empty:pt-3': isContained && !isModal,
      'top---modal-header-height': isModal,
      'bg-default dark:bg-default-dark': noHeaderUpdate || isContained,
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
  initIsIntersecting?: boolean
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

const {headerHeight} = useHeader()

onMounted(() => {
  if (!getIsClientSide()) return

  if (indicatorRef.value) {
    observer = new IntersectionObserver(observerCb, {
      root: null,
      rootMargin: `-${ headerHeight.value }px 100% 0px 0px`,
      threshold: 1.0,
    })

    observer.observe(indicatorRef.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

defineSlots<{
  header: (props: InfiniteListHeaderScope) => VNode[]
  default: (props: InfiniteListHeaderScope) => VNode[]
}>()
</script>
