<template>
  <WButtonMore
    :icon="markRaw(IconTableSettings)"
    :disabled="disabled"
    class="h-full w-full items-center"
  >
    <div class="p-4">
      <div class="grid grid-cols-1">
        <HeaderFieldNested :fields="fields">
          <template #default="{field, nested, first, last}">
            <HeaderSettingsItem
              :field="field"
              :field-config="fieldConfigMap[field.label]"
              :query-params="queryParams"
              :disabled="disabled"
              :disabled-drag="nested"
              :order="getOrder(field)"
              @drag:start="dragStart(field.label, $event)"
              @drag:enter="dragEnter($event, nested, first, last)"
              @drag:end="drop"
              @update:fields-config-map="$emit('update:field-config-map', {...fieldConfigMap, ...$event})"
            />
          </template>
        </HeaderFieldNested>
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
import type {FieldConfig, ListField, ListFields} from '../types'
import HeaderSettingsItem from './HeaderSettingsItem.vue'
import HeaderFieldNested from './HeaderFieldNested.vue'

const props = defineProps<{
  fields: ListFields<Data, QueryParams>
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

const dragStart = (label: string, order: number): void => {
  dragItem.value = label
  dragItemNewOrder.value = order
}

const dragEnter = (order: number, nested: boolean, first: boolean, last: boolean): void => {
  if (nested) {
    if (dragItemNewOrder.value === null) return

    if (first) {
      if (order < dragItemNewOrder.value) dragItemNewOrder.value = order
    } else if (last) {
      if (order > dragItemNewOrder.value) dragItemNewOrder.value = order
    }

    return
  }

  dragItemNewOrder.value = order
}

const dragEnd = () => {
  dragItem.value = null
  dragItemNewOrder.value = null
}

const drop = () => {
  const newConfig: Record<string, FieldConfig> = {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processConfig = <F extends ListFields<any, any>>(fields: F) => {
    fields.forEach((field) => {
      if ('label' in field) newConfig[field.label] = {...props.fieldConfigMap[field.label], order: getOrder(field)}

      if ('fields' in field) processConfig(field.fields)
    }, {})
  }

  processConfig(props.fields)

  Object.values(newConfig)
    .sort((a, b) => a.order - b.order)
    .forEach((item, index) => {
      item.order = index
    })

  if (Object.keys(newConfig).some(key => props.fieldConfigMap[key].order !== newConfig[key].order)) emit('update:field-config-map', newConfig)

  dragEnd()
}

</script>