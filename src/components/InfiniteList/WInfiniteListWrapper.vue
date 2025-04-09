<template>
  <div
    ref="indicator"
    class="print:hidden"
  />

  <div
    ref="header"
    class="sticky print:hidden"
    :class="{
      '-top--modal-header-height bg-default dark:bg-default-dark': isModal,
      '-top--header-height': !isModal,
    }"
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
import {inject, onUnmounted, watch} from 'vue'

import {wIsModal} from '@/components/Modal/models/injection'
import {BASE_ZINDEX_DROPDOWN, BASE_ZINDEX_LIST_HEADER} from '@/utils/utils'

import {useInfiniteListHeader} from './use/useInfiniteListHeader'

const props = defineProps<{
  initIsIntersecting?: boolean
}>()

const isModal = inject(wIsModal, false)

const {indicator, header, headerTop, headerHeight, isIntersecting, updateHeaderHeight, updateHeaderPadding} = useInfiniteListHeader(props.initIsIntersecting)

if (!isModal) {
  watch(isIntersecting, updateHeaderHeight)

  onUnmounted(() => {
    updateHeaderPadding(0)
  })
}
</script>
