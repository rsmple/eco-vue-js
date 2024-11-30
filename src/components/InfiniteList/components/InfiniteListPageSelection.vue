<template>
  <WCheckbox
    v-if="tooltipTextPersisted"
    :model-value="chekboxValueReversed"
    :disabled="disabled"
    intermediate
    class="w-full"
    @update:model-value="selectOrUnselect"
  >
    {{ tooltipText }}
  </WCheckbox>

  <WCheckbox
    v-else
    :model-value="chekboxValueReversed"
    :disabled="disabled"
    :tooltip-text="tooltipText"
    intermediate
    @update:model-value="selectOrUnselect"
  />
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData">
import {computed} from 'vue'

import WCheckbox from '@/components/Checkbox/WCheckbox.vue'

const props = defineProps<{
  selected: Model[]
  items: Data[]
  disabled?: boolean
  tooltipTextPersisted?: boolean
  selectOnly?: boolean
  unselectOnly?: boolean
  reverse?: boolean
  valueGetter: (data: Data) => Model
}>()

const emit = defineEmits<{
  (e: 'update:selected', values: Model[]): void
}>()

const models = computed(() => props.items.map(item => props.valueGetter(item)))
const selectedItems = computed(() => models.value.filter(item => props.selected.includes(item)))
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

const chekboxValueReversed = computed(() => props.disabled ? false : chekboxValue.value === null ? null : props.reverse ? !chekboxValue.value : chekboxValue.value)

const tooltipText = computed(() => `${ chekboxValueReversed.value === true ? 'Unselect' : 'Select' } page (${ props.items.length } item${ props.items.length === 1 ? '' : 's' })`)

const selectOrUnselect = (isSelect: boolean): void => {
  if (props.reverse ? !isSelect : isSelect) {
    emit('update:selected', [...props.selected, ...models.value].filter((item, index, arr) => arr.indexOf(item) === index))
  } else {
    emit('update:selected', props.selected.filter(item => !models.value.includes(item)))
  }
}
</script>
