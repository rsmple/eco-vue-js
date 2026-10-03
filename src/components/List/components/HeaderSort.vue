<template>
  <WDropdownMenu
    v-if="fieldsFiltered.length"
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.LEFT_INNER"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconSort)"
        :disabled="disabled"
        :active="isOpen"
        :tooltip-text="isOpen ? undefined : 'Sort'"
        label="Sort"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #content>
      <WClickOutside
        class="surface-raised my-2 grid grid-cols-1 overflow-hidden rounded-xl shadow-md outline-1 outline-line-raised"
        @click="isOpen = false"
      >
        <HeaderSortItem
          v-for="field in fieldsFiltered"
          :key="field.meta.label"
          :title="typeof field.meta.title === 'string' ? field.meta.title : field.meta.title(queryParams)"
          :field="typeof field.meta.field === 'string' ? field.meta.field : field.meta.field(queryParams)!"
          :ordering="ordering"
          :disabled="disabled"
          @update:ordering="$emit('update:ordering', $event)"
        />

        <div class="mx-4 mt-2 border-b border-solid border-line-subtle" />

        <div class="flex justify-end p-2">
          <button
            class="relative rounded-lg bg-surface-muted px-2 py-1 text-sm"
            :class="{
              'w-ripple w-ripple-hover': canClear,
              'cursor-not-allowed opacity-50': !canClear,
            }"
            :disabled="!canClear"
            :aria-disabled="!canClear"
            aria-label="Clear sorting"
            @click="canClear && $emit('update:ordering', [])"
          >
            Clear
          </button>
        </div>
      </WClickOutside>
    </template>
  </WDropdownMenu>
  <div
    v-else-if="fieldsFlat.length"
    class="h-8"
  />
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

type RequiredField = ListFieldExport<FieldComponent<Data, QueryParams>, ListField<Data, QueryParams> & Required<Pick<ListField<Data, QueryParams>, 'field'>>>

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

const canClear = computed(() => !props.disabled && props.ordering.length !== 0)

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

const fieldsFiltered = computed(() => fieldsFlat.value.filter(item => typeof item.meta.field === 'string' || item.meta.field(props.queryParams)))
</script>