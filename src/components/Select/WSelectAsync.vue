<template>
  <WInputSuggest
    ref="input"
    :title="title"
    :description="description"
    :model-value="search"
    :max-length="maxSearchLength"
    :loading="loading || isFetchingPrefix"
    :hide-input="isMobile ? !focused : !isOpen"
    :readonly="readonly"
    :skeleton="skeleton"
    :size="searchSize"
    :error-message="errorMessage"
    :required="required"
    :disabled="disabled"
    :has-changes="hasChanges"
    :placeholder="placeholder"
    @update:model-value="!loading && !isFetchingPrefix && $emit('update:search', $event as string ?? '')"

    @keypress:enter.stop.prevent="list?.selectCursor()"
    @keypress:up.prevent="list?.cursorUp()"
    @keypress:down.prevent="list?.cursorDown()"
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
      <SelectAsyncList
        ref="list"
        :model-value="modelValue"
        :use-query-fn="useQueryFn"
        :query-params="queryParams"
        :is-invalid-page="isInvalidPage"
        :loading="loading || isFetchingPrefix"
        :disabled="isDisabled"
        :empty-stub="emptyStub ?? 'No match'"
        :allow-update-selected="allowUpdateSelected"
        @select="select"
        @unselect="unselect"
        @update:selected="updateSelected"
      >
        <template #default="{option, selected, skeleton: skeletonList}">
          <slot
            name="option"
            :option="option"
            :selected="selected"
            :skeleton="skeletonList"
            :model="false"
          >
            <component
              :is="optionComponent"
              :option="option"
              :selected="selected"
              :skeleton="skeletonList"
              :model="false"
            />
          </slot>
        </template>
      </SelectAsyncList>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Data extends DefaultData">
import {ref, nextTick, computed} from 'vue'
import {getIsMobile} from '@/utils/mobile'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'
import SelectAsyncList from './components/SelectAsyncList.vue'

const props = defineProps<{
  modelValue: number[]
  search: string
  useQueryFn: UseDefaultQueryFn<Data>
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
  allowUpdateSelected?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'select', item: number): void
  (e: 'unselect', item: number): void
  (e: 'update:search', value: string): void
  (e: 'update:modelValue', value: number[]): void
}>()

const isOpen = ref(false)
const input = ref<ComponentInstance<typeof WInputSuggest> | undefined>()
const list = ref<ComponentInstance<typeof SelectAsyncList<Data>> | undefined>()
const isMobile = getIsMobile()
const focused = ref(false)
const isFetchingPrefix = ref(false)

const isDisabled = computed(() => props.loading || isFetchingPrefix.value || props.readonly || props.disabled)

const close = () => {
  isOpen.value = false
  focused.value = false
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

const updateSelected = (value: number[]): void => {
  if (isDisabled.value || !props.allowUpdateSelected) return

  emit('update:modelValue', value)
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

defineSlots<{
  right?: (props: Record<string, never>) => void
  option?: (props: {option: Data, selected: boolean, skeleton: boolean, model: boolean}) => void
}>()

</script>
