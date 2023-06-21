<template>
  <WCheckbox
    :model-value="chekboxValue"
    :disabled="disabled"
    :tooltip-text="!tooltipTextPersisted ? tooltipText : undefined"
    intermediate
    :class="{
      'w-full': tooltipTextPersisted,
    }"
    @update:model-value="selectOrUnselect"
  >
    <template v-if="tooltipTextPersisted">
      {{ tooltipText }}
    </template>
  </WCheckbox>
</template>

<script lang="ts" setup>
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import {computed} from 'vue'
import type {DefaultData} from '../models/types'

const props = defineProps<{
  selected: number[]
  items: DefaultData[]
  disabled?: boolean
  tooltipTextPersisted?: boolean
  selectOnly?: boolean
  unselectOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:selected', values: number[]): void
}>()

const ids = computed(() => props.items.map(item => item.id))
const selectedItems = computed(() => ids.value.filter(id => props.selected.includes(id)))
const hasSelected = computed(() => selectedItems.value.length !== 0)

const chekboxValue = computed(() => {
  if (props.selectOnly) return false
  if (props.unselectOnly) return true

  if (selectedItems.value.length === props.items.length) {
    return hasSelected.value
  } else {
    return hasSelected.value ? null : false
  }
})

const tooltipText = computed(() => `${chekboxValue.value === true ? 'Unselect' : 'Select'} page (${props.items.length} item${props.items.length === 1 ? '' : 's'})`)

const selectOrUnselect = (isSelect: boolean): void => {
  if (isSelect) {
    const newSelected = [...props.selected, ...ids.value]

    emit('update:selected', newSelected.filter((id, index) => newSelected.indexOf(id) === index))
  } else {
    emit('update:selected', props.selected.filter(id => !ids.value.includes(id)))
  }
}

</script>

