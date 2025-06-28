<template>
  <div
    ref="indicator"
    class="print:hidden"
  />

  <template v-if="isModal">
    <div
      ref="header"
      class="-top--modal-header-height bg-default dark:bg-default-dark sticky print:hidden"
      :style="{zIndex: isIntersecting ? BASE_ZINDEX_DROPDOWN : BASE_ZINDEX_LIST_HEADER}"
    >
      <slot name="header" />
    </div>

    <slot />
  </template>

  <InfiniteListWrapper
    v-else
    :is-intersecting="isIntersecting"
  >
    <template #header="scope">
      <slot
        name="header"
        v-bind="scope"
      />
    </template>

    <template #default="scope">
      <slot v-bind="scope" />
    </template>
  </InfiniteListWrapper>
</template>

<script lang="ts" setup>
import {inject, onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

import {wIsModal} from '@/components/Modal/models/injection'
import {BASE_ZINDEX_DROPDOWN, BASE_ZINDEX_LIST_HEADER, isClientSide} from '@/utils/utils'

import InfiniteListWrapper from './components/InfiniteListWrapper.vue'

import {useHeader} from '../HeaderBar/use/useHeader'

const props = defineProps<{
  initIsIntersecting?: boolean
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
</script>
