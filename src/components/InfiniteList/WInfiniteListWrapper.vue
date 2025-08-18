<template>
  <div
    ref="indicator"
    class="print:hidden"
  />

  <InfiniteListHeaderHeight
    :is-intersecting="isIntersecting"
    class="sticky print:hidden"
    :class="{
      '-top--header-height': !isModal && !noHeaderUpdate,
      '-top--modal-header-height bg-default dark:bg-default-dark': isModal || noHeaderUpdate,
    }"
    :style="{zIndex: isIntersecting ? BASE_ZINDEX_DROPDOWN : BASE_ZINDEX_LIST_HEADER}"
  >
    <template
      v-if="isModal || noHeaderUpdate"
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
import {BASE_ZINDEX_DROPDOWN, BASE_ZINDEX_LIST_HEADER, isClientSide} from '@/utils/utils'

import InfiniteListHeaderHeight from './components/InfiniteListHeaderHeight.vue'
import InfiniteListHeaderPadding from './components/InfiniteListHeaderPadding.vue'

import {useHeader} from '../HeaderBar/use/useHeader'

defineOptions({inheritAttrs: false})

const props = defineProps<{
  initIsIntersecting?: boolean
  noHeaderUpdate?: boolean
}>()

const isModal = inject(wIsModal, false)

const isIntersecting = ref(props.initIsIntersecting)
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
  if (!isClientSide) return

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
