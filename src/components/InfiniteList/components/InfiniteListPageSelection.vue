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

<script lang="ts" setup generic="Data extends DefaultData">
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'
import {computed} from 'vue'

const props = defineProps<{
  selected: number[]
  items: Data[]
  disabled?: boolean
  tooltipTextPersisted?: boolean
  selectOnly?: boolean
  unselectOnly?: boolean
  reverse?: boolean
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

const chekboxValueReversed = computed(() => props.disabled ? false : chekboxValue.value === null ? null : props.reverse ? !chekboxValue.value : chekboxValue.value)

const tooltipText = computed(() => `${chekboxValueReversed.value === true ? 'Unselect' : 'Select'} page (${props.items.length} item${props.items.length === 1 ? '' : 's'})`)

const selectOrUnselect = (isSelect: boolean): void => {
  if (props.reverse ? !isSelect : isSelect) {
    emit('update:selected', [...props.selected, ...ids.value].filter((id, index, arr) => arr.indexOf(id) === index))
  } else {
    emit('update:selected', props.selected.filter(id => !ids.value.includes(id)))
  }
}

</script>

