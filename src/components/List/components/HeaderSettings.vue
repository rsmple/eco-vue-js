<template>
  <WButtonMore
    :icon="markRaw(IconTableSettings)"
    :disabled="disabled"
    class="h-full w-full"
  >
    <div class="p-4">
      <div class="flex flex-col">
        <HeaderSettingsItem
          v-for="field in fields"
          :key="field.label"
          :field="field"
          :field-config="fieldConfigMap[field.label]"
          :query-params="queryParams"
          :disabled="disabled"
          :style="{
            order: getOrder(field),
          }"
          @drag:start="dragItem = field.label"
          @drag:enter="dragEnter(field)"
          @drag:end="drop"
          @update:fields-config-map="$emit('update:field-config-map', {...fieldConfigMap, ...$event})"
        />
      </div>

      <div class="border-b border-solid border-gray-200 dark:border-gray-700 my-4" />
      
      <button
        class="relative py-1 px-2 rounded-lg bg-gray-100 dark:bg-gray-800"
        :class="{
          'w-ripple w-ripple-hover': hasSaved,
          'cursor-not-allowed opacity-50': !hasSaved,
        }"
        :disabled="!hasSaved"
        @click="hasSaved && $emit('click:reset')"
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
  fieldConfigMap: Record<string, FieldConfig>
  queryParams: QueryParams
  hasSaved?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:field-config-map', value: Record<string, FieldConfig>): void
  (e: 'click:reset'): void
}>()

const dragItem = ref<string | null>(null)
const dragItemNewOrder = ref<number | null>(null)

const getOrder = (field: ListField<Data, QueryParams>): number => {
  if (dragItem.value === null || dragItemNewOrder.value === null) return props.fieldConfigMap[field.label].order

  if (field.label === dragItem.value) return dragItemNewOrder.value

  if (props.fieldConfigMap[field.label].order <= dragItemNewOrder.value) return props.fieldConfigMap[field.label].order - 1

  return props.fieldConfigMap[field.label].order
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
    result[field.label] = {...props.fieldConfigMap[field.label], order: getOrder(field)}
    return result
  }, {})

  if (Object.keys(newConfig).some(key => props.fieldConfigMap[key].order !== newConfig[key].order)) emit('update:field-config-map', newConfig)

  dragEnd()
}

</script>