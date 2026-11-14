<template>
  <slot v-bind="scope" />
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData">
import type {InfiniteListItemScope} from '../types'

/** An item of a recycled row, rendered again only when its scope changes. */
defineProps<{
  scope: Omit<InfiniteListItemScope<Data, Model>, 'resetting'>
}>()

defineSlots<{
  default?: (props: Omit<InfiniteListItemScope<Data, Model>, 'resetting'>) => void
}>()
</script>
