<template>
  <WInputSuggest
    ref="input"
    v-bind="{
      ...props,
      modelValue: search,
      loading: loading || isFetchingPrefix || loadingCreate,
      hideInput: isMobile ? !focused : !isOpen,
      filterValue: filterValue === undefined ? modelValue : filterValue,
    }"
    :class="$attrs.class"
    @update:model-value="!loading && !isFetchingPrefix && (search = $event as string ?? '')"

    @keypress:enter.stop.prevent="listRef?.selectCursor()"
    @keypress:up.prevent="listRef?.cursorUp()"
    @keypress:down.prevent="listRef?.cursorDown()"
    @keypress:delete="captureDoubleDelete"

    @open="isOpen = true"
    @close="close"
    @focus="focused = true; $emit('focus', $event)"
    @blur="focused = false; $emit('blur', $event)"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template
      v-if="$slots.subtitle"
      #subtitle
    >
      <slot name="subtitle" />
    </template>

    <template #prefix="{unclickable}">
      <SelectAsyncPrefix
        v-if="hidePrefix ? isMobile ? (unclickable || !focused) : !isOpen : true"
        :use-query-fn="useQueryFnPrefix ?? useQueryFnOptions"
        :model-value="modelValue"
        :disabled="disabled"
        :loading="loading || isFetchingPrefix"
        :option-component="(optionComponent as SelectOptionComponent<Data>)"
        :option-component-props="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
        :disable-clear="disableClear || readonly"
        :preview-data="previewData"
        :created-data="createdData"
        :value-getter="valueGetter"
        :value-query-key="valueQueryKey"
        @unselect="unselect"
        @update:fetching="!$event && updateDropdown(); isFetchingPrefix = $event"
        @update:model-value="updateSelected"
      >
        <template
          v-if="$slots.option"
          #default="{option, skeleton: skeletonPrefix, index}"
        >
          <slot
            name="option"
            :option="option"
            :index="index"
            :selected="true"
            :model="true"
            :skeleton="skeletonPrefix"
          />
        </template>
      </SelectAsyncPrefix>
    </template>

    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <SelectAsyncList
        ref="list"
        :model-value="modelValue"
        :use-query-fn="useQueryFnOptions"
        :query-params="queryParams"
        :loading="loading || isFetchingPrefix"
        :disabled="isDisabled"
        :empty-stub="!search && emptyStub ? emptyStub : undefined"
        :allow-create="createOption && (!hasSearchOption || isModelValueSearch)"
        :hide-option-icon="hideOptionIcon"
        :value-getter="valueGetter"
        :loading-create="loadingCreate"
        :search="search"
        @select="select"
        @unselect="unselect"
        @create:option="create(search)"
        @update:model-value="updateSelected"
      >
        <template #default="{option, selected, skeleton: skeletonList}">
          <slot
            name="option"
            :option="option"
            :selected="selected"
            :skeleton="skeletonList"
            :model="false"
            :search="search"
          >
            <component
              v-bind="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
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

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectAsyncProps, SelectOptionComponent, SelectOptionComponentProps} from './types'

import {computed, nextTick, ref, useTemplateRef, watch} from 'vue'

import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import {useIsMobile} from '@/utils/mobile'

import SelectAsyncList from './components/SelectAsyncList.vue'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectAsyncProps<Model, Data, QueryParams, OptionComponent>>(),
  {
    emptyStub: 'No match',
    valueGetter: (data: Data) => (data.id as Model),
    valueQueryKey: 'id__in',
  },
)

const emit = defineEmits<{
  (e: 'select', item: Model): void
  (e: 'unselect', item: Model): void
  (e: 'update:modelValue', value: Model[]): void
  (e: 'init-model'): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}>()

const {isMobile} = useIsMobile()

const isOpen = ref(false)
const inputRef = useTemplateRef('input')
const listRef = useTemplateRef('list')
const focused = ref(false)
const isFetchingPrefix = ref(false)
const search = ref('')
const loadingCreate = ref(false)

const isDisabled = computed(() => props.loading || props.readonly || props.disabled)
const isModelValueSearch = computed(() => !!search.value && props.modelValue.includes(search.value as Model))
const enabled = computed(() => !props.disabled)
const queryParams = computed(() => ({...props.queryParamsOptions, [props.searchField ?? 'search']: search.value}))
const queryParamsFirstPage = computed(() => ({...queryParams.value, page: 1}))

const {data: firstPageData} = props.useQueryFnOptions(queryParamsFirstPage, {enabled: false})

const hasSearchOption = computed(() => {
  if (props.createdData?.some(option => props.valueGetter(option) === search.value)) return true

  return firstPageData.value?.results.some(option => props.valueGetter(option) === search.value)
})

const close = () => {
  isOpen.value = false
  focused.value = false

  if (props.selectOnClose && search.value && !isModelValueSearch.value) {
    const optionExact = firstPageData.value?.results.find(option => props.valueGetter(option) === search.value)

    if (optionExact) select(props.valueGetter(optionExact))
    else create(search.value)
  }

  search.value = ''
}

let deletePressTimeout: NodeJS.Timeout | null = null

const captureDoubleDelete = () => {
  if (!props.modelValue.length || search.value.length) return

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

  search.value = ''
}

const unselect = (item: Model): void => {
  if (isDisabled.value) return

  emit('unselect', item)

  search.value = ''
}

const create = async (value: string) => {
  if (isDisabled.value) return
  if (!props.createOption) return

  loadingCreate.value = true

  const option = await props.createOption(value)

  if (option) {
    select(props.valueGetter(option))

    search.value = ''
  }

  loadingCreate.value = false
}

const updateSelected = (value: Model[]): void => {
  if (isDisabled.value) return

  emit('update:modelValue', value)

  search.value = ''
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const updateDropdown = async () => {
  await nextTick()

  inputRef.value?.updateDropdown()
}

const setSearch = (value: string): void => {
  search.value = value
}

if (props.useQueryFnDefault) {
  const {data: defaultData} = props.useQueryFnDefault({enabled})

  watch(defaultData, value => {
    if (value && props.modelValue.length === 0) {
      select(props.valueGetter(value))
      emit('init-model')
    }
  }, {immediate: true})
}

defineExpose({
  focus,
  blur,
  setSearch,
})

defineSlots<{
  title?: () => void
  subtitle?: () => void
  right?: (props: Record<string, never>) => void
  option?: (props: {option: Data | null, index?: number, selected: boolean, skeleton: boolean, model: boolean, search?: string}) => void
}>()
</script>
