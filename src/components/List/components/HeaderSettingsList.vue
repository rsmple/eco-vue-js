<template>
  <WDragContainer
    :list="sortFields(fields, fieldConfigMap)"
    :disabled="disabled"
    class="grid grid-cols-1"
    @update:list="$emit('update:list', $event as ListFields<Data, QueryParams>)"
  >
    <template #default="{item, container, dragging, initDrag}">
      <div
        v-if="'fields' in item.meta" 
        :style="container.style"
        class="relative isolate"
      >
        <div
          v-if="dragging"
          v-bind="container"
          class="absolute inset-x-0 top-0 z-10 h-7"
        />

        <HeaderSettingsList
          :fields="(item.meta.fields as ListFields<Data, QueryParams>)"
          :field-config-map="fieldConfigMap"
          :query-params="queryParams"
          :disabled="disabled"
          :style="container.style"
          @update:list="$emit('update:list', $event)"
          @update:field-config-map="$emit('update:field-config-map', $event)"
        />
      </div>

      <div
        v-else-if="'label' in item.meta"
        class="bg-default dark:bg-default-dark grid select-none grid-cols-[1.75rem,1fr,auto]"
        v-bind="container"
      >
        <button
          v-if="!disabled"
          class="w-ripple w-ripple-hover relative flex cursor-grab items-center justify-center active:cursor-grabbing"
          @mousedown="initDrag"
        >
          <IconDrag class="rotate-90" />
        </button>

        <div class="col-start-2 self-center truncate px-2 py-1 font-semibold">
          {{ typeof item.meta.title === 'string' ? item.meta.title : item.meta.title(queryParams) }}
        </div>

        <button
          class="w-ripple w-ripple-hover relative flex items-center px-2"
          @click="$emit('update:field-config-map', {[item.meta.label]: {...fieldConfigMap[item.meta.label], visible: !fieldConfigMap[item.meta.label].visible}})"
        >
          <component
            :is="fieldConfigMap[item.meta.label].visible ? IconEye : IconEyeSlash"
            class="pointer-events-none"
          />
        </button>
      </div>
    </template>
  </WDragContainer>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {FieldConfig, ListFields} from '../types'

import WDragContainer from '@/components/DragContainer/WDragContainer.vue'

import IconDrag from '@/assets/icons/sax/IconDrag.svg?component'
import IconEye from '@/assets/icons/sax/IconEye.svg?component'
import IconEyeSlash from '@/assets/icons/sax/IconEyeSlash.svg?component'

import {sortFields} from '../use/useListConfig'

defineProps<{
  fields: ListFields<Data, QueryParams>
  fieldConfigMap: Record<string, FieldConfig>
  queryParams: QueryParams
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:list', value: ListFields<Data, QueryParams>): void
  (e: 'update:field-config-map', value: Record<string, FieldConfig>): void
}>()
</script>