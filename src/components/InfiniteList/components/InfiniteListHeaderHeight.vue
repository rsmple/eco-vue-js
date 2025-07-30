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

import {type VNode, inject, onMounted, ref, useTemplateRef, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {wModalHeaderHeight} from '@/components/Modal/models/injection'
import {isClientSide} from '@/utils/utils'

import {wScrollingElement} from '../models/injection'

const props = defineProps<{
  isIntersecting: boolean
}>()

const headerRef = useTemplateRef('header')
const headerHeight = ref<number>(0)
const headerTop = ref<number>(0)

const {headerHeight: headerHeightLayout} = useHeader()

const modalHeaderHeight = inject(wModalHeaderHeight, undefined)

const scrollingElement = inject(wScrollingElement, null)

const updateHeader = () => {
  if (!headerRef.value) return

  const rect = headerRef.value.getBoundingClientRect()
  headerHeight.value = rect.height
  headerTop.value = rect.top + (scrollingElement?.value?.scrollTop ?? document.scrollingElement?.scrollTop ?? 0) - (modalHeaderHeight ?? headerHeightLayout.value)
}

watch(() => props.isIntersecting, updateHeader)

onMounted(() => {
  if (!isClientSide) return
    
  updateHeader()
})

defineSlots<{
  header: (props: InfiniteListHeaderScope) => VNode[]
  default: (props: InfiniteListHeaderScope) => VNode[]
}>()
</script>
