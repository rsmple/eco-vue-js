<template>
  <slot />
</template>

<script setup lang="ts">
import type {TabsItemProps, TabsItemScopedProps} from './types'

defineProps<TabsItemProps>()

defineSlots<{
  default?: () => void
  title?: (props: TabsItemScopedProps) => void
  suffix?: (props: TabsItemScopedProps) => void
  right?: (props: TabsItemScopedProps) => void
}>()
</script>