<template>
  <DropdownOverlay
    :is-open="isOpen"
    @close="isOpen = false"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconListSettings)"
        :disabled="disabled"
        :active="isOpen"
        :tooltip-text="isOpen ? undefined : 'Table settings'"
        label="Table settings"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #header>
      <div class="py-2 text-base font-semibold">
        Table settings
      </div>
    </template>

    <template #content>
      <div class="grid grid-cols-1 overflow-hidden">
        <div class="p-4">
          <div
            class="grid items-start"
            :class="!mobile && !noMode ? 'grid-cols-[auto_auto_auto]' : 'grid-cols-1'"
          >
            <div
              v-if="!mobile && !noMode"
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
              v-if="!mobile && !noMode"
              class="mx-4 h-full border-r border-solid border-line-subtle"
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

          <div class="my-4 border-b border-solid border-line-subtle" />
      
          <div class="flex justify-end">
            <button
              class="relative rounded-lg bg-surface-muted px-2 py-1"
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
      </div>
    </template>
  </DropdownOverlay>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {FieldConfig, ListFields} from '../types'

import {markRaw, ref} from 'vue'

import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'

import IconListSettings from '@/assets/icons/IconListSettings.svg?component'

import DropdownOverlay from '@/components/DropdownMenu/components/DropdownOverlay.vue'
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
  noMode: boolean
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
          ...props.fieldConfigMap[field.meta.label]!,
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

  if (Object.keys(newConfigMap).some(key => props.fieldConfigMap[key]?.order !== newConfigMap[key]?.order)) emit('update:field-config-map', newConfigMap)
}
</script>