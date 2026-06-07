<template>
  <div
    ref="header"
    v-bind.attr="$attrs"
  >
    <slot
      name="header"
      v-bind="{headerTop, headerHeight, updateHeader}"
    />
  </div>

  <slot v-bind="{headerTop, headerHeight, updateHeader}" />
</template>

<script lang="ts" setup>
import type {InfiniteListHeaderScope} from '../types'

import {type VNode, inject, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {wModalHeaderHeight} from '@/components/Modal/models/injection'
import {getIsClientSide} from '@/utils/utils'

import {wScrollingElement} from '../models/injection'

defineProps<{
  isIntersecting: boolean
}>()

const headerRef = useTemplateRef('header')
const headerHeight = ref<number>(0)
const headerTop = ref<number>(0)

const {headerHeight: headerHeightLayout} = useHeader()

const modalHeaderHeight = inject(wModalHeaderHeight, undefined)

const scrollingElement = inject(wScrollingElement, null)

const updateHeaderTop = () => {
  if (!headerRef.value) return

  const rect = headerRef.value.getBoundingClientRect()
  headerTop.value = rect.top + (scrollingElement?.value?.scrollTop ?? document.scrollingElement?.scrollTop ?? 0) - (modalHeaderHeight?.value ?? headerHeightLayout.value)
}

const updateHeader = () => {
  if (!headerRef.value) return

  const rect = headerRef.value.getBoundingClientRect()
  headerHeight.value = rect.height
  headerTop.value = rect.top + (scrollingElement?.value?.scrollTop ?? document.scrollingElement?.scrollTop ?? 0) - (modalHeaderHeight?.value ?? headerHeightLayout.value)
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
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

watch(() => modalHeaderHeight?.value ?? headerHeightLayout.value, updateHeaderTop)

defineSlots<{
  header: (props: InfiniteListHeaderScope) => VNode[]
  default: (props: InfiniteListHeaderScope) => VNode[]
}>()
</script>
