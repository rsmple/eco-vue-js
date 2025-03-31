<template>
  <div
    ref="indicator"
    class="print:hidden"
  />

  <div
    ref="header"
    class="sticky print:hidden"
    :class="{
      'z-20': !isIntersecting,
      'z-[2]': isIntersecting,
      '-top--modal-header-height bg-default dark:bg-default-dark': isModal,
      '-top--header-height': !isModal,
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
import {inject, onUnmounted, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'
import {wIsModal} from '@/components/Modal/models/injection'

import {useInfiniteListHeader} from './use/useInfiniteListHeader'

const props = defineProps<{
  initIsIntersecting?: boolean
}>()

const isModal = inject(wIsModal, false)

const {updateHeaderPadding, headerHeight: headerElementHeight} = useHeader()

const {indicator, header, headerTop, headerHeight, isIntersecting, updateHeader} = useInfiniteListHeader(headerElementHeight, props.initIsIntersecting)

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
