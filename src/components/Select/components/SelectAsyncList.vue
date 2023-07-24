<template>
  <WInfiniteList
    :use-query-fn="useQueryFn"
    :query-params="queryParams"
    :is-invalid-page="isInvalidPage"
    :scrolling-element="scrollingElement"
    :transition="transition"
    :exclude-params="excludeParams"
    :selected="allowUpdateSelected ? modelValue : undefined"
    :empty-stub="emptyStub"
    :select-only="selectOnly"
    :unselect-only="unselectOnly"
    hide-page-title
    no-gap
    header-top-ignore
    min-height
    @update:count="$emit('update:count', $event)"
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
        :previous="previous?.id"
        :next="next?.id"
        :is-no-cursor="cursor === undefined"
        :class="{
          'pt-4': !noPadding && first,
          'pb-4': !noPadding && last,
        }"
        @select="$emit('select', item.id); setLoadingOptionId(item.id)"
        @unselect="$emit('unselect', item.id); setLoadingOptionId(item.id)"
        @mouseenter="!skeleton && setCursor(item.id)"
        @update:cursor="setCursor(item.id)"
        @update:is-cursor="updateCursors(previous?.id, next?.id)"
        @update:previous="cursorPrevious = $event"
        @update:next="cursorNext = $event"
        @unmounted="resetting ? cursor = undefined : cursor = next?.id"
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
  allowUpdateSelected?: boolean
  selectOnly?: boolean
  unselectOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', value: number): void
  (e: 'unselect', value: number): void
  (e: 'update:count', value: number): void
  (e: 'update:modelValue', value: number[]): void
}>()

const cursor = ref<number | undefined>(undefined)
const cursorPrevious = ref<number | undefined>(undefined)
const cursorNext = ref<number | undefined>(undefined)
const isCursorLocked = ref(false)
const loadingOptionId = ref<number | undefined>(undefined)

const setLoadingOptionId = (value: number): void => {
  loadingOptionId.value = value
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
  if (props.disabled || cursorPrevious.value === undefined) return

  lockCursor()

  cursor.value = cursorPrevious.value
}

const cursorDown = () => {
  if (props.disabled || cursorNext.value === undefined) return

  lockCursor()

  cursor.value = cursorNext.value
}

const selectCursor = () => {
  if (props.disabled) return

  if (cursor.value !== undefined && cursor.value > 0) {
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
  default?: (props: {option: Data, selected: boolean, skeleton: boolean}) => void
}>()

</script>