<template>
  <div class="min-h-[4.125rem]">
    <WInfiniteList
      :use-query-fn="useQueryFn"
      :query-params="queryParams"
      :is-invalid-page="isInvalidPage"
      :scrolling-element="scrollingElement"
      :transition="transition"
      :exclude-params="excludeParams"
      :selected="modelValue"
      :empty-stub="emptyStub"
      :select-only="selectOnly"
      :unselect-only="unselectOnly"
      hide-page-title
      no-gap
      header-top-ignore
      min-height
      @update:count="$emit('update:count', $event); count = $event"
      @update:selected="!disabled && $emit('update:modelValue', $event)"
    >
      <template #default="{item, skeleton, previous, next, first, last, resetting}">
        <SelectOption
          :is-selected="!skeleton && modelValue.includes(item.id)"
          :is-cursor="!skeleton && item.id === cursor"
          :loading="loading && loadingOptionId === item.id"
          :skeleton="skeleton"
          :scroll="isCursorLocked"
          :first="first"
          :last="last"
          :previous="first && props.allowCreate ? null : previous?.id"
          :next="last && props.allowCreate ? null : next?.id"
          :is-no-cursor="cursor === undefined"
          :class="{
            'pt-4': !noPadding && first,
            'pb-4': !noPadding && last && !allowCreate,
          }"
          @select="$emit('select', item.id); setLoadingOptionId(item.id)"
          @unselect="$emit('unselect', item.id); setLoadingOptionId(item.id)"
          @mouseenter="!skeleton && setCursor(item.id)"
          @update:cursor="setCursor(item.id)"
          @update:is-cursor="updateCursors($event.previous, $event.next)"
          @update:previous="cursorPrevious = $event"
          @update:next="cursorNext = $event"
          @unmounted="resetting ? cursor = undefined : cursor = next?.id"
          @update:first="firstItem = item.id"
          @update:last="lastItem = item.id"
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
      :loading="loading && loadingOptionId === null"
      :scroll="isCursorLocked"
      :previous="lastItem"
      :next="firstItem"
      :first="count === 0"
      :is-no-cursor="cursor === undefined"
      class="first:pt-4 last:pb-4"
      @mouseenter="setCursor(null)"
      @update:cursor="setCursor(null)"
      @select="$emit('create:option'); setLoadingOptionId(null)"
      @update:is-cursor="updateCursors($event.previous, $event.next)"
      @update:previous="cursorPrevious = $event"
      @update:next="cursorNext = $event"
      @unmounted="cursor = undefined"
    >
      <span class="w-select-field pr-2 sm-not:px-3 min-w-[4rem]">
        Create:
      </span>

      <slot
        :option="null"
        :selected="false"
        :skeleton="false"
      />
    </SelectOption>
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData">
import {ref} from 'vue'
import SelectOption from './SelectOption.vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'
import {debounce} from '@/utils/utils'

const props = defineProps<{
  modelValue: number[]
  useQueryFn: UsePaginatedQuery<Data>
  queryParams: QueryParams
  isInvalidPage: (error: unknown) => boolean
  scrollingElement?: Element | null
  loading?: boolean
  disabled?: boolean
  transition?: boolean
  excludeParams?: string[]
  noPadding?: boolean
  emptyStub?: string
  selectOnly?: boolean
  unselectOnly?: boolean
  allowCreate?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', value: number): void
  (e: 'unselect', value: number): void
  (e: 'update:count', value: number): void
  (e: 'update:modelValue', value: number[]): void
  (e: 'create:option'): void
}>()

const cursor = ref<number | null | undefined>(undefined)
const cursorPrevious = ref<number | null | undefined>(undefined)
const cursorNext = ref<number | null | undefined>(undefined)
const isCursorLocked = ref(false)
const loadingOptionId = ref<number | null | undefined>(undefined)
const firstItem = ref<number | undefined>()
const lastItem = ref<number | undefined>()
const count = ref(0)

const setLoadingOptionId = (value: number | null): void => {
  loadingOptionId.value = value
}

const unlockCursor = debounce(() => {
  isCursorLocked.value = false
}, 50)

const lockCursor = () => {
  isCursorLocked.value = true

  unlockCursor()
}

const setCursor = (value: number | null): void => {
  if (isCursorLocked.value) return

  cursor.value = value
}

const updateCursors = (previous: number | null | undefined, next: number | null | undefined) => {
  cursorPrevious.value = previous
  cursorNext.value = next
}

const cursorUp = () => {
  if (props.disabled || cursorPrevious.value === undefined) return

  lockCursor()

  cursor.value = cursorPrevious.value === null && !props.allowCreate ? lastItem.value : cursorPrevious.value
}

const cursorDown = () => {
  if (props.disabled || cursorNext.value === undefined) return

  lockCursor()

  cursor.value = cursorNext.value === null && !props.allowCreate ? firstItem.value : cursorNext.value
}

const selectCursor = () => {
  if (props.disabled || cursor.value === undefined) return

  if (cursor.value === null) {
    if (props.allowCreate) emit('create:option')
    return
  }

  if (cursor.value > 0) {
    setLoadingOptionId(cursor.value)

    if (props.modelValue.includes(cursor.value)) emit('unselect', cursor.value)
    else emit('select', cursor.value)
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