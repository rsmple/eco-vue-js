<template>
  <div
    ref="indicator"
    class="print:hidden"
  />

  <div
    ref="header"
    class="-top--header-height sticky print:hidden"
    :class="{
      'z-20': !isIntersecting,
      'z-[2]': isIntersecting,
    }"
  >
    <slot
      name="header"
      v-bind="{updateHeaderHeight}"
    />
  </div>

  <slot v-bind="{headerTop, headerHeight}" />
</template>

<script lang="ts" setup>
import {onUnmounted, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'

import {useInfiniteListHeader} from './use/useInfiniteListHeader'

const props = defineProps<{
  scrollingElement?: Element | null
  initIsIntersecting?: boolean
}>()

const {updateHeaderPadding, headerHeight: headerElementHeight} = useHeader()

const {indicator, header, headerTop, headerHeight, isIntersecting, updateHeader} = useInfiniteListHeader(headerElementHeight, props.scrollingElement, props.initIsIntersecting)

const updateHeaderHeight = () => {
  if (!isIntersecting.value && headerHeight.value) {
    updateHeader()

    updateHeaderPadding(headerHeight.value)
  } else {
    updateHeaderPadding(0)
  }
}

watch(isIntersecting, updateHeaderHeight)

onUnmounted(() => {
  updateHeaderPadding(0)
})
</script>
