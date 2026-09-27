<template>
  <slot />
</template>

<script setup lang="ts">
import type {TabsItemProps} from './types'

defineProps<TabsItemProps>()

defineEmits<{
  /** The close button was clicked. Listening to it adds the button to the tab. */
  (e: 'close'): void
}>()

type StateScope = {hasChanges?: boolean, hasError?: boolean, hasValue?: boolean}

defineSlots<{
  /** Content of the tab. */
  default?: () => void
  /** Replaces the content of the tab button. */
  title?: (props: StateScope) => void
  /** Content after the title, inside the tab button. */
  suffix?: (props: StateScope) => void
  /** Content after the tab button. */
  right?: (props: StateScope) => void
}>()
</script>