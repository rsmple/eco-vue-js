<template>
  <WDropdownMenu
    :is-open="isOpen"
    :max-width="400"
    :max-height="300"
    :horizontal-align="HorizontalAlign.RIGHT_INNER"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconTableSettings)"
        :disabled="disabled"
        :active="isOpen"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #content>
      <WClickOutside
        class="bg-default dark:bg-default-dark my-2 grid grid-cols-1 overflow-hidden rounded-xl shadow-md dark:outline dark:outline-1 dark:outline-gray-800"
        @click="isOpen = false"
      >
        <div class="p-4">
          <div class="grid grid-cols-[auto,auto,auto] items-start">
            <div
              v-if="!mobile"
              class="flex flex-col gap-4"
            >
              <HeaderSettingsModeButton
                v-for="item in listModeList"
                :key="item"
                :icon="listModeIconMap[item]"
                :active="mode === item"
                @click="$emit('update:mode', item)"
              />
            </div>

            <div
              v-if="!mobile"
              class="mx-4 h-full border-r border-solid border-gray-200 dark:border-gray-700"
            />

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
          </div>

          <div class="my-4 border-b border-solid border-gray-200 dark:border-gray-700" />
      
          <div class="flex justify-end">
            <button
              class="relative rounded-lg bg-gray-100 px-2 py-1 dark:bg-gray-800"
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
        </div>
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {FieldConfig, ListField, ListFields} from '../types'

import {inject, markRaw, provide, ref} from 'vue'

import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconTableSettings from '@/assets/icons/sax/IconTableSettings.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {BASE_ZINDEX_LIST_HEADER, type ListMode, wBaseZIndex} from '@/utils/utils'

import HeaderFieldNested from './HeaderFieldNested.vue'
import HeaderSettingsItem from './HeaderSettingsItem.vue'
import HeaderSettingsModeButton from './HeaderSettingsModeButton.vue'

import {listModeIconMap, listModeList} from '../use/useListConfig'

const props = defineProps<{
  fields: ListFields<Data, QueryParams>
  fieldConfigMap: Record<string, FieldConfig>
  mode: ListMode
  queryParams: QueryParams
  hasSaved: boolean
  mobile: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:field-config-map', value: Record<string, FieldConfig>): void
  (e: 'update:mode', value: ListMode): void
  (e: 'click:reset'): void
}>()

const baseZIndex = inject(wBaseZIndex, null)

provide(wBaseZIndex, baseZIndex ?? BASE_ZINDEX_LIST_HEADER)

const isOpen = ref(false)

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