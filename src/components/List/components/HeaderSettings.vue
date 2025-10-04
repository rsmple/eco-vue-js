<template>
  <WDropdownMenu
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.RIGHT_INNER"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconListSettings)"
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
                :label="listModeLabelMap[item]"
                :active="mode === item"
                @click="$emit('update:mode', item)"
              />
            </div>

            <div
              v-if="!mobile"
              class="mx-4 h-full border-r border-solid border-gray-200 dark:border-gray-700"
            />

            <HeaderSettingsList
              :fields="fields"
              :field-config-map="fieldConfigMap"
              :query-params="queryParams"
              class="text-description"
              @update:field-config-map="$emit('update:field-config-map', {...fieldConfigMap, ...$event})"
              @update:list="updateOrder"
            />
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
              :aria-disabled="!hasSaved"
              aria-label="Reset column settings"
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
import type {FieldConfig, ListFields} from '../types'

import {markRaw, ref} from 'vue'

import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconListSettings from '@/assets/icons/IconListSettings.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {type ListMode} from '@/utils/utils'

import HeaderSettingsList from './HeaderSettingsList.vue'
import HeaderSettingsModeButton from './HeaderSettingsModeButton.vue'

import {isField} from '../models/utils'
import {listModeIconMap, listModeLabelMap, listModeList, sortFields} from '../use/useListConfig'

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

const isOpen = ref(false)

const updateOrder = (list: ListFields<Data, QueryParams>) => {
  let currentIndex = 0

  const newConfigMap: Record<string, FieldConfig> = {}

  const processFields = (fields: ListFields<Data, QueryParams>) => {
    let currentFields

    if (list.some(field => fields.includes(field))) {
      currentFields = list
    } else {
      currentFields = sortFields(fields, props.fieldConfigMap) as ListFields<Data, QueryParams>
    }

    currentFields.forEach(field => {
      currentIndex++

      if (isField(field)) {
        newConfigMap[field.meta.label] = {
          ...props.fieldConfigMap[field.meta.label],
          order: currentIndex,
        }
      } else processFields(field.meta.fields as ListFields<Data, QueryParams>)
    })
  }

  processFields(props.fields)

  Object.values<FieldConfig>(newConfigMap)
    .sort((a, b) => a.order - b.order)
    .forEach((item, index) => {
      item.order = index + 1
    })

  if (Object.keys(newConfigMap).some(key => props.fieldConfigMap[key].order !== newConfigMap[key].order)) emit('update:field-config-map', newConfigMap)
}
</script>