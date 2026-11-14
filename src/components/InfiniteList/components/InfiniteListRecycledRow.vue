<template>
  <div
    ref="row"
    class="w-infinite-list-row absolute inset-x-0 grid grid-cols-[inherit] [column-gap:inherit]"
  >
    <div
      v-if="column"
      aria-hidden="true"
      :style="{gridColumn: `span ${ column }`}"
    />

    <InfiniteListRecycledCell
      v-for="(cell, index) in cells"
      :key="index"
      :scope="cell"
    >
      <template #default="scope">
        <slot v-bind="scope" />
      </template>
    </InfiniteListRecycledCell>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData">
import type {InfiniteListItemScope} from '../types'

import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

import InfiniteListRecycledCell from './InfiniteListRecycledCell.vue'

/**
 * One row of the grid the list places by `top` and gives to another line of items when this one leaves the view: one
 * item spanning the row in a table, a card per column in a grid. A cell renders again only when its scope changes, so
 * moving the row or parking it renders nothing. Not a stacking context: the page list's gutter strips lie between its
 * scrolling and its sticky cells.
 */
defineProps<{
  cells: Omit<InfiniteListItemScope<Data, Model>, 'resetting'>[]
  /** Columns left empty before the first cell, in the first row of a list starting past its first page. */
  column: number
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
