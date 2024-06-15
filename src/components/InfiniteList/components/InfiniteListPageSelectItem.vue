<template>
  <slot />
</template>

<script lang="ts" setup>
import {provide, toRef} from 'vue'
import {wInfiniteListSelectionItem} from '../models/injection'

const props = defineProps<{
  selected?: boolean
  selectedBetween?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void
  (e: 'update:selected-range'): void
  (e: 'update:selected-range-hover'): void
}>()

provide(wInfiniteListSelectionItem, {
  selected: toRef(props, 'selected'),
  selectedBetween: toRef(props, 'selectedBetween'),

  updateSelected: (value) => emit('update:selected', value),
  updateSelectedRange: () => emit('update:selected-range'),
  updateSelectedRangeHover: () => emit('update:selected-range-hover'),
})

</script>