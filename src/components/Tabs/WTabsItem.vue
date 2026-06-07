<template>
  <slot />
</template>

<script setup lang="ts">
import type {TabsItemProps} from './types'

defineProps<TabsItemProps>()

defineEmits<{
  (e: 'close'): void
}>()

defineSlots<{
  default?: () => void
  title?: () => void
  suffix?: () => void
  right?: () => void
}>()
</script>