<template>
  <slot />
</template>

<script setup lang="ts">
import type {TabsItemScopedProps} from './types'

defineProps<{
  title: string
  name: string
  icon?: SVGComponent
  disabled?: boolean
  removable?: boolean
  divided?: boolean
  init?: boolean
}>()

defineSlots<{
  default?: () => void
  title?: (props: TabsItemScopedProps) => void
  suffix?: (props: TabsItemScopedProps) => void
  right?: (props: TabsItemScopedProps) => void
}>()
</script>