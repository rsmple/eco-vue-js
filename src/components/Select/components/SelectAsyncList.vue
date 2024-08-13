<template>
  <div>
    <WInfiniteList
      :use-query-fn="useQueryFn"
      :query-params="(queryParams as QueryParams)"
      :is-invalid-page="isInvalidPage"
      :scrolling-element="scrollingElement"
      :transition="transition"
      :exclude-params="excludeParams"
      :selected="modelValue"
      :empty-stub="emptyStub"
      :select-only="selectOnly"
      :unselect-only="unselectOnly"
      :value-getter="valueGetter"
      :query-options="queryOptions"
      :skeleton-length="count || 1"
      :last-child="!allowCreate"
      hide-page-title
      header-top-ignore
      min-height
      no-gap
      @update:count="$emit('update:count', $event); count = $event"
      @update:selected="!disabled && $emit('update:modelValue', $event)"
    >
      <template #default="{item, skeleton, previous, next, first, last, resetting}">
        <SelectOption
          :is-selected="!skeleton && modelValue.includes(valueGetter(item))"
          :is-cursor="!skeleton && valueGetter(item) === cursor"
          :loading="loading && loadingOption === valueGetter(item)"
          :skeleton="skeleton"
          :scroll="isCursorLocked"
          :first="first"
          :last="last"
          :previous="first && props.allowCreate ? null : previous ? valueGetter(previous) : undefined"
          :next="last && props.allowCreate ? null : next ? valueGetter(next) : undefined"
          :is-no-cursor="cursor === undefined"
          :hide-option-icon="hideOptionIcon"
          :class="{
            'pt-4': !noPadding && first,
            'pb-4': !noPadding && last && !allowCreate,
          }"
          @select="$emit('select', valueGetter(item)); setLoadingOption(valueGetter(item))"
          @unselect="$emit('unselect', valueGetter(item)); setLoadingOption(valueGetter(item))"
          @mouseenter="!skeleton && setCursor(valueGetter(item))"
          @update:cursor="setCursor(valueGetter(item))"
          @update:is-cursor="updateCursors"
          @update:previous="cursorPrevious = ($event as UnwrapRef<Model>)"
          @update:next="cursorNext = ($event as UnwrapRef<Model>)"
          @unmounted="resetting ? cursor = undefined : cursor = ((next ? valueGetter(next) : undefined) as UnwrapRef<Model>)"
          @update:first="firstItem = valueGetter(item)"
          @update:last="lastItem = valueGetter(item)"
        >
          <template #default="{selected}">
            <slot
              :option="item"
              :selected="selected"
              :skeleton="skeleton"
            />
          </template>
        </SelectOption>
      </template>
    </WInfiniteList>

    <SelectOption
      v-if="allowCreate"
      :is-selected="false"
      :is-cursor="cursor === null"
      :loading="loading && loadingOption === null"
      :scroll="isCursorLocked"
      :previous="lastItem"
      :next="firstItem"
      :first="count === 0"
      :is-no-cursor="cursor === undefined"
      :hide-option-icon="hideOptionIcon"
      class="first:pt-4 last:pb-4"
      @mouseenter="setCursor(null)"
      @update:cursor="setCursor(null)"
      @select="$emit('create:option'); setLoadingOption(null)"
      @update:is-cursor="updateCursors"
      @update:previous="cursorPrevious = ($event as UnwrapRef<Model>)"
      @update:next="cursorNext = ($event as UnwrapRef<Model>)"
      @unmounted="cursor = undefined"
    >
      <template #prefix>
        <span class="w-select-field pr-2 sm-not:px-3">
          Create:
        </span>
      </template>

      <slot
        :option="null"
        :selected="false"
        :skeleton="false"
      />
    </SelectOption>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, ApiError, QueryParams">
import {ref, type UnwrapRef} from 'vue'
import SelectOption from './SelectOption.vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'
import {debounce} from '@/utils/utils'

const props = defineProps<{
  modelValue: Model[]
  useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
  queryParams: QueryParams
  isInvalidPage: (error: unknown) => boolean
  scrollingElement?: Element | null
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
  queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>
}>()

const emit = defineEmits<{
  (e: 'select', value: Model): void
  (e: 'unselect', value: Model): void
  (e: 'update:count', value: number): void
  (e: 'update:modelValue', value: Model[]): void
  (e: 'create:option'): void
}>()

const cursor = ref<Model | null | undefined>(undefined)
const cursorPrevious = ref<Model | null | undefined>(undefined)
const cursorNext = ref<Model | null | undefined>(undefined)
const isCursorLocked = ref(false)
const loadingOption = ref<Model | null | undefined>(undefined)
const firstItem = ref<Model | undefined>()
const lastItem = ref<Model | undefined>()
const count = ref(0)

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

const setCursor = (value: Model | null): void => {
  if (isCursorLocked.value) return

  cursor.value = value as UnwrapRef<Model>
}

const updateCursors = (event: {previous: Model | null | undefined, next: Model | null | undefined}) => {
  cursorPrevious.value = event.previous as UnwrapRef<Model>
  cursorNext.value = event.next as UnwrapRef<Model>
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

  if (cursor.value) {
    setLoadingOption(cursor.value as Model)

    if (props.modelValue.includes(cursor.value as Model)) emit('unselect', cursor.value as Model)
    else emit('select', cursor.value as Model)
  }
}

defineExpose({
  cursorUp,
  cursorDown,
  selectCursor,
})

defineSlots<{
  default?: (props: {option: Data | null, selected: boolean, skeleton: boolean}) => void
}>()

</script>