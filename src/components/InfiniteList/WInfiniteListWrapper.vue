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
    <slot
      name="header"
      v-bind="{updateHeaderHeight}"
    />
  </div>

  <slot v-bind="{headerTop, headerHeight}" />
</template>

<script lang="ts" setup>
import {onUnmounted, watch} from 'vue'

import {useHeaderPadding} from '@/components/HeaderBar/use/useHeaderPadding'

import {useInfiniteListHeader} from './use/useInfiniteListHeader'

const props = defineProps<{
  scrollingElement?: Element | null
  initIsIntersecting?: boolean
}>()

const {updateHeaderPadding} = useHeaderPadding()

const {indicator, header, headerTop, headerHeight, isIntersecting, updateHeader} = useInfiniteListHeader(props.scrollingElement, props.initIsIntersecting)

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
