<template>
  <WInputSuggest
    ref="input"
    :title="title"
    :description="description"
    :model-value="search"
    :max-length="maxSearchLength"
    :loading="loading || isFetchingPrefix"
    :hide-input="isMobile ? !focused : !isOpen"
    hide-input-unclickable
    :readonly="readonly"
    :skeleton="skeleton"
    :size="searchSize"
    :error-message="errorMessage"
    :required="required"
    :disabled="disabled"
    :has-changes="hasChanges"
    :hide-prefix="hidePrefix ? isMobile ? focused : isOpen : false"
    @update:model-value="!loading && !isFetchingPrefix && $emit('update:search', $event as string ?? '')"

    @keypress:enter.stop.prevent="selectCursor"
    @keypress:up.prevent="cursorUp"
    @keypress:down.prevent="cursorDown"
    @keypress:delete="captureDoubleDelete"

    @open="isOpen = true"
    @close="close(); $emit('update:search', '')"
    @focus="focused = true"
    @blur="focused = false"
  >
    <template #prefix>
      <SelectAsyncPrefix
        :use-query-fn="useQueryFn"
        :model-value="modelValue"
        :disabled="disabled"
        :loading="loading || isFetchingPrefix"
        :option-component="optionComponent"
        :disable-clear="disableClear"
        @unselect="unselect"
        @update:fetching="!$event && updateDropdown(); isFetchingPrefix = $event"
      >
        <template #default="{option, skeleton: skeletonPrefix}">
          <slot
            name="option"
            :option="option"
            :selected="true"
            :model="true"
            :skeleton="skeletonPrefix"
          />
        </template>
      </SelectAsyncPrefix>
    </template>

    <template #right>
      <slot name="right" />
    </template>

    <template #content>
      <WInfiniteList
        :use-query-fn="useQueryFn"
        :query-params="queryParams"
        :is-invalid-page="isInvalidPage"
        hide-page-title
        no-gap
        header-top-ignore
        min-height
        @update:count="count = $event"
      >
        <template #default="{item, skeleton: listSkeleton, previous, next, first, last}">
          <SelectOption
            :is-selected="!listSkeleton && modelValue.includes(item.id)"
            :is-cursor="!listSkeleton && item.id === cursor"
            :loading="(loading || isFetchingPrefix) && loadingOptionIndex === item.id"
            :skeleton="listSkeleton"
            :scroll="isCursorLocked"
            :first="first"
            :last="last"
            :previous="previous?.id"
            :next="next?.id"
            :is-no-cursor="cursor === undefined"
            @select="select(item.id); setLoadingOptionIndex(item.id)"
            @unselect="unselect(item.id); setLoadingOptionIndex(item.id)"
            @mouseenter="!listSkeleton && setCursor(item.id)"
            @update:cursor="setCursor(item.id)"
            @update:is-cursor="updateCursors(previous?.id, next?.id)"
            @update:previous="cursorPrevious = $event"
            @update:next="cursorNext = $event"
            @unmounted="cursor = undefined"
          >
            <template #default="{selected}">
              <slot
                name="option"
                :option="item"
                :selected="selected"
                :model="false"
                :skeleton="listSkeleton"
              >
                <component
                  :is="optionComponent"
                  :option="item"
                  :selected="selected"
                  :skeleton="listSkeleton"
                  :model="false"
                />
              </slot>
            </template>
          </SelectOption>
        </template>
      </WInfiniteList>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup>
import {ref, nextTick, computed} from 'vue'
import SelectOption from './components/SelectOption.vue'
import {getIsMobile} from '@/utils/mobile'
import {debounce} from '@/utils/utils'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import WInfiniteList from '../InfiniteList/WInfiniteList.vue'
import type {QueryParams, UseDefaultQueryFn} from '../InfiniteList/models/types'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'

const props = defineProps<{
  modelValue: number[]
  search: string
  useQueryFn: UseDefaultQueryFn
  isInvalidPage: (error: unknown) => boolean
  queryParams: QueryParams
  title?: string
  description?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: VueComponent
  disableClear?: boolean
  hidePrefix?: boolean
  readonly?: boolean
  disabled?: boolean
  skeleton?: boolean
  searchSize?: number
  allowCreate?: boolean
  errorMessage?: string
  required?: boolean
  hasChanges?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', item: number): void
  (e: 'unselect', item: number): void
  (e: 'update:search', value: string): void
}>()

const isOpen = ref(false)
const input = ref<InstanceType<typeof WInputSuggest> | undefined>()
const cursor = ref<number | undefined>(undefined)
const cursorPrevious = ref<number | undefined>(undefined)
const cursorNext = ref<number | undefined>(undefined)
const isCursorLocked = ref(false)
const isMobile = getIsMobile()
const focused = ref(false)
const count = ref(0)
const loadingOptionIndex = ref<number | null>(null)
const isFetchingPrefix = ref(false)

const isDisabled = computed(() => props.loading || isFetchingPrefix.value || props.readonly || props.disabled)

const close = () => {
  isOpen.value = false
  focused.value = false
}

const setLoadingOptionIndex = (value: number) => {
  if (isDisabled.value) return

  loadingOptionIndex.value = value
}

const unlockCursor = debounce(() => {
  isCursorLocked.value = false
}, 50)

const lockCursor = () => {
  isCursorLocked.value = true

  unlockCursor()
}

const setCursor = (value: number): void => {
  if (isCursorLocked.value) return

  cursor.value = value
}

const updateCursors = (previous: number | undefined, next: number | undefined) => {
  cursorPrevious.value = previous
  cursorNext.value = next
}

const cursorUp = () => {
  if (isDisabled.value || cursorPrevious.value === undefined) return

  lockCursor()

  cursor.value = cursorPrevious.value
}

const cursorDown = () => {
  if (isDisabled.value || cursorNext.value === undefined) return

  lockCursor()

  cursor.value = cursorNext.value
}

const selectCursor = () => {
  if (isDisabled.value) return

  if (cursor.value !== undefined && cursor.value > 0) {
    setLoadingOptionIndex(cursor.value)

    if (props.modelValue.includes(cursor.value)) unselect(cursor.value)
    else select(cursor.value)
  }
}

let deletePressTimeout: NodeJS.Timeout | null = null

const captureDoubleDelete = () => {
  if (!props.modelValue.length || props.search.length) return

  if (deletePressTimeout) {
    unselect(props.modelValue[props.modelValue.length - 1])

    clearTimeout(deletePressTimeout)
    deletePressTimeout = null
  } else {
    deletePressTimeout = setTimeout(() => {
      deletePressTimeout = null
    }, 500)
  }
}

const select = (item: number): void => {
  if (isDisabled.value) return

  emit('select', item)
}

const unselect = (item: number): void => {
  if (isDisabled.value) return

  emit('unselect', item)
}

const focus = () => {
  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
}

const updateDropdown = async () => {
  await nextTick()

  input.value?.updateDropdown()
}

defineExpose({
  focus,
  blur,
})

</script>
