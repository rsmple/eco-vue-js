<template>
  <div
    ref="header"
    class="-top--header-height sticky print:hidden"
    :style="{zIndex: isIntersecting ? BASE_ZINDEX_DROPDOWN : BASE_ZINDEX_LIST_HEADER}"
  >
    <slot
      name="header"
      v-bind="{updateHeaderHeight}"
    />
  </div>

  <slot v-bind="{headerTop, headerHeight}" />
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, toRef, watch} from 'vue'

import {BASE_ZINDEX_DROPDOWN, BASE_ZINDEX_LIST_HEADER, isClientSide} from '@/utils/utils'

import {useInfiniteListHeader} from '../use/useInfiniteListHeader'

const props = defineProps<{
  isIntersecting: boolean
}>()

const isIntersectingRef = toRef(props, 'isIntersecting')

const {header, headerTop, headerHeight, updateHeader, updateHeaderHeight, updateHeaderPadding} = useInfiniteListHeader(isIntersectingRef)

watch(isIntersectingRef, updateHeaderHeight)

onMounted(() => {
  if (!isClientSide) return
    
  updateHeader()
})

onUnmounted(() => {
  updateHeaderPadding(0)
})
</script>
