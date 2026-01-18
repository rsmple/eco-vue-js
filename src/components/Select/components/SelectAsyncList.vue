<template>
  <div>
    <SelectOption
      v-if="allowCreate"
      :is-selected="false"
      :is-cursor="cursor === null"
      :loading="loading && (loadingCreate || loadingOption === null)"
      :scroll="isCursorLocked"
      :previous="lastItem"
      :next="firstItem"
      :first="count === 0"
      :is-no-cursor="cursor === undefined"
      :hide-option-icon="hideOptionIcon"
      :disabled="!search || isModelValueSearch"
      class="first:-pt--w-select-option-padding last:-pb--w-select-option-padding"
      @mouseenter="setCursor(null)"
      @update:cursor="setCursor(null)"
      @select="$emit('create:option'); setLoadingOption(null)"
      @update:is-cursor="updateCursors"
      @update:previous="cursorPrevious = ($event as typeof cursorPrevious)"
      @update:next="cursorNext = ($event as typeof cursorNext)"
      @unmounted="updateCursor(undefined)"
    >
      <template #prefix>
        <span class="w-option flex items-center pr-2">
          Create:
        </span>
      </template>

      <slot
        v-if="search && !isModelValueSearch"
        :option="undefined"
        :selected="false"
        :skeleton="false"
        :search="search"
        :model="false"
        :index="undefined"
      />

      <div
        v-else
        class="text-description w-option flex items-center"
      >
        Start typing..
      </div>
    </SelectOption>

    <WInfiniteList
      :use-query-fn="useQueryFn"
      :query-params="(queryParams as QueryParams)"
      :transition="transition"
      :exclude-params="excludeParams"
      :empty-stub="emptyStub"
      :value-getter="valueGetter"
      :query-options="queryOptions"
      :skeleton-length="count || 1"
      :last-child="!allowCreate"
      hide-page-title
      header-top-ignore
      min-height
      @update:count="$emit('update:count', $event); count = $event; updateCursor(undefined)"
    >
      <template #default="{item, skeleton, previous, next, first, last, index}">
        <SelectOption
          ref="option"
          :is-selected="!skeleton && modelValue.includes(valueGetter(item))"
          :is-cursor="!skeleton && valueGetter(item) === cursor"
          :loading="loading && loadingOption === valueGetter(item)"
          :skeleton="skeleton"
          :scroll="isCursorLocked"
          :first="first"
          :last="last"
          :previous="first && allowCreate ? null : previous ? valueGetter(previous) : undefined"
          :next="last && allowCreate ? null : next ? valueGetter(next) : undefined"
          :is-no-cursor="cursor === undefined"
          :hide-option-icon="hideOptionIcon"
          :class="{
            '-pt--w-select-option-padding': !noPadding && first && !allowCreate,
            '-pb--w-select-option-padding': !noPadding && last,
          }"
          @select="emitSelect(valueGetter(item), item)"
          @unselect="emitUnselect(valueGetter(item))"
          @mouseenter="!skeleton && setCursor(valueGetter(item))"
          @update:cursor="setCursor(valueGetter(item))"
          @update:is-cursor="updateCursors"
          @update:previous="cursorPrevious = ($event as typeof cursorPrevious)"
          @update:next="cursorNext = ($event as typeof cursorNext)"
          @unmounted="updateCursor(next ? valueGetter(next) : undefined)"
          @update:first="firstItem = valueGetter(item)"
          @update:last="lastItem = valueGetter(item)"
        >
          <template #default="{selected}">
            <slot
              :option="item"
              :selected="selected"
              :skeleton="skeleton"
              :search="undefined"
              :index="index"
              :model="false"
            />
          </template>
        </SelectOption>
      </template>

      <template #empty>
        <div
          class="w-select-option -pb--w-select-option-padding"
          :class="{
            '-pt--w-select-option-padding': !noPadding && !allowCreate,
          }"
        >
          <div class="w-option flex cursor-default select-none items-center">
            {{ !search && emptyStub ? emptyStub : search ? 'No match' : 'Nothing to show' }}
          </div>
        </div>
      </template>
    </WInfiniteList>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {SelectOptionProps} from '../types'

import {type UnwrapRef, computed, ref, useTemplateRef} from 'vue'

import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'

import {debounce} from '@/utils/utils'

import SelectOption from './SelectOption.vue'

const props = defineProps<{
  modelValue: Model[]
  useQueryFn: UseQueryPaginated<Data, QueryParams>
  queryParams: QueryParams
  loading?: boolean
  disabled?: boolean
  transition?: boolean
  excludeParams?: (keyof QueryParams)[]
  noPadding?: boolean
  emptyStub?: string
  selectOnly?: boolean
  unselectOnly?: boolean
  allowCreate?: boolean
  hideOptionIcon?: boolean
  valueGetter: (data: Data) => Model
  queryOptions?: Partial<Parameters<UseQueryPaginated<Data, QueryParams>>[1]>
  loadingCreate?: boolean
  search?: string
}>()

const emit = defineEmits<{
  (e: 'select', value: Model, data: Data): void
  (e: 'unselect', value: Model): void
  (e: 'update:count', value: number): void
  (e: 'update:model-value', value: Model[]): void
  (e: 'create:option'): void
}>()

const optionRef = useTemplateRef<ComponentInstance<typeof SelectOption>[]>('option')

const cursor = ref<Model | null | undefined>(undefined)
const cursorPrevious = ref<Model | null | undefined>(undefined)
const cursorNext = ref<Model | null | undefined>(undefined)
const isCursorLocked = ref(false)
const loadingOption = ref<Model | null | undefined>(undefined)
const firstItem = ref<Model | undefined>()
const lastItem = ref<Model | undefined>()
const count = ref(0)
const isModelValueSearch = computed(() => !!props.search && props.modelValue.includes(props.search as Model))

const setLoadingOption = (value: Model | null): void => {
  loadingOption.value = value as UnwrapRef<Model>
}

const unlockCursor = debounce(() => {
  isCursorLocked.value = false
}, 50)

const lockCursor = () => {
  isCursorLocked.value = true

  unlockCursor()
}

const updateCursor = (value: Model | null | undefined): void => {
  cursor.value = value
}

const setCursor = (value: Model | null | undefined): void => {
  if (isCursorLocked.value) return

  cursor.value = value
}

const updateCursors = (event: {previous: Model | null | undefined, next: Model | null | undefined}) => {
  cursorPrevious.value = event.previous
  cursorNext.value = event.next
}

const cursorUp = () => {
  if (props.disabled || cursorPrevious.value === undefined) return

  lockCursor()

  cursor.value = (cursorPrevious.value === null && !props.allowCreate ? lastItem.value : cursorPrevious.value) as UnwrapRef<Model>
}

const cursorDown = () => {
  if (props.disabled || cursorNext.value === undefined) return

  lockCursor()

  cursor.value = (cursorNext.value === null && !props.allowCreate ? firstItem.value : cursorNext.value) as UnwrapRef<Model>
}

const selectCursor = () => {
  if (props.disabled || cursor.value === undefined) return

  if (cursor.value === null) {
    if (props.allowCreate) emit('create:option')
    return
  }

  if (cursor.value) optionRef.value?.forEach(item => item.toggleCursor())
}

const emitSelect = (value: Model, data: Data): void => {
  if (props.disabled || props.loading) return
  if (props.unselectOnly) return

  emit('select', value, data)
  setLoadingOption(value)
}

const emitUnselect = (value: Model): void => {
  if (props.disabled || props.loading) return
  if (props.selectOnly) return

  emit('unselect', value)
  setLoadingOption(value)
}

defineExpose({
  cursorUp,
  cursorDown,
  selectCursor,
})

defineSlots<{
  default?: (props: PartialNot<SelectOptionProps<Data>>) => void
}>()
</script>