<template>
  <WInputSuggest
    ref="input"
    :title="title"
    :mobile-title="mobileTitle"
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
    :no-margin="noMargin"
    :icon="icon"
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
    <template #prefix="{unclickable}">
      <SelectAsyncPrefix
        v-if="hidePrefix ? isMobile ? (unclickable || !focused) : !isOpen : true"
        :use-query-fn="useQueryFn"
        :model-value="modelValue"
        :disabled="disabled"
        :loading="loading || isFetchingPrefix"
        :option-component="optionComponent"
        :disable-clear="disableClear"
        :preview-data="previewData"
        :created-data="createdData"
        :value-getter="valueGetter ?? ((item: Data) => (item.id as Model))"
        :value-query-key="valueQueryKey"
        @unselect="unselect"
        @update:fetching="!$event && updateDropdown(); isFetchingPrefix = $event"
        @update:model-value="updateSelected"
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

    <template
      v-if="$slots.right?.()?.length"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <SelectAsyncList
        ref="list"
        :model-value="modelValue"
        :use-query-fn="useQueryFn"
        :query-params="(queryParams as QueryParams)"
        :is-invalid-page="isInvalidPage"
        :loading="loading || isFetchingPrefix"
        :disabled="isDisabled"
        :empty-stub="emptyStub ?? 'No match'"
        :allow-create="allowCreate && search !== ''"
        :hide-option-icon="hideOptionIcon"
        :value-getter="valueGetter"
        :query-options="queryOptions"
        class="h-80"
        @select="select"
        @unselect="unselect"
        @create:option="create"
        @update:model-value="updateSelected"
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
              :search="search"
            />
          </slot>
        </template>
      </SelectAsyncList>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, ApiError, QueryParams">
import {ref, nextTick, computed, type Component} from 'vue'
import {getIsMobile} from '@/utils/mobile'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'
import SelectAsyncList from './components/SelectAsyncList.vue'

const props = withDefaults(
  defineProps<{
    modelValue: Model[]
    search: string
    useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
    isInvalidPage: (error: unknown) => boolean
    queryParams: QueryParams
    title?: string
    mobileTitle?: string
    description?: string
    loading?: boolean
    emptyStub?: string
    maxSearchLength?: number
    optionComponent?: Component<{option: Data, selected?: boolean, model?: boolean}>
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
    placeholder?: string
    noMargin?: boolean
    icon?: SVGComponent
    mono?: boolean
    previewData?: Data[]
    createdData?: Data[]
    hideOptionIcon?: boolean
    valueGetter?: (data: Data) => Model
    valueQueryKey?: string
    queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>
  }>(),
  {
    title: undefined,
    mobileTitle: undefined,
    description: undefined,
    emptyStub: undefined,
    maxSearchLength: undefined,
    optionComponent: undefined,
    searchSize: undefined,
    errorMessage: undefined,
    placeholder: undefined,
    icon: undefined,
    previewData: undefined,
    createdData: undefined,
    valueGetter: (data: Data) => (data.id as Model),
    valueQueryKey: 'id__in',
    queryOptions: undefined,
  },
)

const emit = defineEmits<{
  (e: 'select', item: Model): void
  (e: 'unselect', item: Model): void
  (e: 'update:search', value: string): void
  (e: 'update:modelValue', value: Model[]): void
  (e: 'create:option', value: string): void
}>()

const isOpen = ref(false)
const input = ref<ComponentInstance<typeof WInputSuggest> | undefined>()
const list = ref<ComponentInstance<typeof SelectAsyncList<Model, Data, ApiError, QueryParams>> | undefined>()
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

const select = (item: Model): void => {
  if (isDisabled.value) return

  emit('select', item)
}

const unselect = (item: Model): void => {
  if (isDisabled.value) return

  emit('unselect', item)
}

const create = (): void => {
  if (isDisabled.value) return

  emit('create:option', props.search)
}

const updateSelected = (value: Model[]): void => {
  if (isDisabled.value) return

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
  option?: (props: {option: Data | null, selected: boolean, skeleton: boolean, model: boolean}) => void
}>()

</script>
