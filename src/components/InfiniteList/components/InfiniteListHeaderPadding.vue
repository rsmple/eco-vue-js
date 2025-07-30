<template>
  <slot />
</template>

<script lang="ts" setup>
import {onUnmounted, watch} from 'vue'

import {useHeader} from '@/components/HeaderBar/use/useHeader'

const props = defineProps<{
  isIntersecting: boolean
  headerHeight: number
}>()

const {updateHeaderPadding} = useHeader()

const updateHeaderHeight = () => {
  if (!props.isIntersecting && props.headerHeight) {
    updateHeaderPadding(props.headerHeight)
  } else {
    updateHeaderPadding(0)
  }
}

watch(() => props.isIntersecting, updateHeaderHeight)
watch(() => props.headerHeight, updateHeaderHeight)

onUnmounted(() => {
  updateHeaderPadding(0)
})
</script>
