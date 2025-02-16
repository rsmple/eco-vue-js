<template>
  <div ref="indicator" />

  <div
    ref="header"
    class="sticky top-[var(--header-height)]"
    :class="{
      'z-20': !isIntersecting,
      'z-[2]': isIntersecting,
    }"
  >
    <slot name="header" />
  </div>

  <slot v-bind="{headerTop, headerHeight}" />
</template>

<script lang="ts" setup>
import {onBeforeUnmount, watch} from 'vue'

import {useHeaderPadding} from '@/components/HeaderBar/use/useHeaderPadding'

import {useInfiniteListHeader} from './use/useInfiniteListHeader'

const props = defineProps<{
  scrollingElement?: Element | null
  initIsIntersecting?: boolean
}>()

const {updateHeaderPadding} = useHeaderPadding()

const {indicator, header, headerTop, headerHeight, isIntersecting, updateHeader} = useInfiniteListHeader(props.scrollingElement, props.initIsIntersecting)

watch(isIntersecting, value => {
  if (!value && headerHeight.value) {
    updateHeader()

    updateHeaderPadding(headerHeight.value)
  } else {
    updateHeaderPadding(0)
  }
})

onBeforeUnmount(() => {
  updateHeaderPadding(0)
})
</script>
