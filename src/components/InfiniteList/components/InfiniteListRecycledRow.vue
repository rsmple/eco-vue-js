<template>
  <div
    ref="row"
    class="w-infinite-list-row absolute inset-x-0 grid [grid-template-columns:inherit]"
  >
    <slot v-bind="scope" />
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData">
import type {InfiniteListItemScope} from '../types'

import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

/**
 * One row the list places by `top` and gives to another item when this one leaves the view. The scope is the only
 * prop, so moving the row or parking it renders nothing again. Not a stacking context: the page list's gutter strips
 * lie between its scrolling and its sticky cells.
 */
defineProps<{
  scope: Omit<InfiniteListItemScope<Data, Model>, 'resetting'>
}>()

const emit = defineEmits<{
  (e: 'mount', value: HTMLDivElement | null): void
}>()

const rowRef = useTemplateRef('row')

onMounted(() => emit('mount', rowRef.value))

onBeforeUnmount(() => emit('mount', null))

defineSlots<{
  default?: (props: Omit<InfiniteListItemScope<Data, Model>, 'resetting'>) => void
}>()
</script>
