<template>
  <WDropdownMenu
    v-if="fieldsFlat.length"
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.RIGHT_INNER"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconSort)"
        :disabled="disabled"
        :active="isOpen"
        :tooltip-text="isOpen ? undefined : 'Sort'"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #content>
      <WClickOutside
        class="bg-default dark:bg-default-dark my-2 grid grid-cols-1 overflow-hidden rounded-xl shadow-md dark:outline dark:outline-1 dark:outline-gray-800"
        @click="isOpen = false"
      >
        <HeaderSortItem
          v-for="field in fieldsFlat"
          :key="field.meta.label"
          :title="typeof field.meta.title === 'string' ? field.meta.title : field.meta.title(queryParams)"
          :field="typeof field.meta.field === 'string' ? field.meta.field : field.meta.field(queryParams)"
          :ordering="ordering"
          :disabled="disabled"
          @update:ordering="$emit('update:ordering', $event)"
        />
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {FieldComponent, FieldConfig, ListField, ListFieldExport, ListFields} from '../types'
import type {OrderItem} from '@/utils/order'

import {computed, markRaw, ref} from 'vue'

import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconSort from '@/assets/icons/IconSort.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {type ListMode} from '@/utils/utils'

import HeaderSortItem from './HeaderSortItem.vue'

type RequiredField = ListFieldExport<FieldComponent<Data>, ListField<Data, QueryParams> & Required<Pick<ListField<Data, QueryParams>, 'field'>>>

const props = defineProps<{
  ordering: OrderItem<keyof Data>[]
  fields: ListFields<Data, QueryParams>
  queryParams: QueryParams
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:field-config-map', value: Record<string, FieldConfig>): void
  (e: 'update:mode', value: ListMode): void
  (e: 'click:reset'): void
  (e: 'update:ordering', value: OrderItem<keyof Data>[]): void
}>()

const isOpen = ref(false)

const isFieldRequired = (field: ListFields<Data, QueryParams>[number]): field is RequiredField => {
  return 'field' in field.meta && field.meta.field !== undefined
}

const fieldsFlat = computed(() => {
  const result: RequiredField[] = []

  const processField = (field: ListFields<Data, QueryParams>[number]) => {
    if (isFieldRequired(field)) result.push(field)
    else if ('fields' in field.meta) (field.meta.fields as ListFields<Data, QueryParams>).forEach(processField)
  }

  props.fields.forEach(processField)

  return result
})
</script>