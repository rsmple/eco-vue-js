<template>
  <WButtonMore
    :icon="markRaw(IconTableSettings)"
    :disabled="disabled"
  >
    <div class="p-4">
      <div class="flex flex-col">
        <HeaderSettingsItem
          v-for="field in fields"
          :key="field.label"
          :field="field"
          :field-config="fieldsConfig[field.label]"
          :query-params="queryParams"
          :disabled="disabled"
          :style="{
            order: getOrder(field),
          }"
          @drag:start="dragItem = field.label"
          @drag:enter="dragEnter(field)"
          @drag:end="drop"
          @update:fields-config="$emit('update:fields-config', $event)"
        />
      </div>

      <div class="border-b border-solid border-gray-200 dark:border-gray-700 my-4" />
      
      <button
        class="relative py-1 px-2 rounded-lg w-ripple w-ripple-hover bg-gray-100 dark:bg-gray-800"
      >
        Reset
      </button>
    </div>
  </WButtonMore>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import WButtonMore from '@/components/Button/WButtonMore.vue'
import {markRaw, ref} from 'vue'
import IconTableSettings from '@/assets/icons/sax/IconTableSettings.svg?component'
import type {FieldConfig, ListField} from '../types'
import HeaderSettingsItem from './HeaderSettingsItem.vue'

const props = defineProps<{
  fields: ListField<Data, QueryParams>[]
  fieldsConfig: Record<string, FieldConfig>
  queryParams: QueryParams
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:fields-config', value: Record<string, FieldConfig>): void
}>()

const dragItem = ref<string | null>(null)
const dragItemNewOrder = ref<number | null>(null)

const getOrder = (field: ListField<Data, QueryParams>): number => {
  if (dragItem.value === null || dragItemNewOrder.value === null) return props.fieldsConfig[field.label].order

  if (field.label === dragItem.value) return dragItemNewOrder.value

  if (props.fieldsConfig[field.label].order <= dragItemNewOrder.value) return props.fieldsConfig[field.label].order - 1

  return props.fieldsConfig[field.label].order
}

const dragEnter = (field: ListField<Data, QueryParams>): void => {
  dragItemNewOrder.value = getOrder(field)
}

const dragEnd = () => {
  dragItem.value = null
  dragItemNewOrder.value = null
}

const drop = () => {
  const newConfig = props.fields.reduce<Record<string, FieldConfig>>((result, field) => {
    result[field.label] = {...props.fieldsConfig[field.label], order: getOrder(field)}
    return result
  }, {})

  if (Object.keys(newConfig).some(key => props.fieldsConfig[key].order !== newConfig[key].order)) emit('update:fields-config', newConfig)

  dragEnd()
}

</script>