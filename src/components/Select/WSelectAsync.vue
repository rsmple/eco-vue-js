<template>
  <WInputSuggest
    ref="input"
    v-bind="{
      ...props,
      modelValue: search,
      loading: loading || isFetchingPrefix || loadingCreate,
      hideInput: modelValue.length === 0 && !emptyValue ? false : isMobile ? !focused : !isOpen,
      filterValue: filterValue === undefined ? modelValue : filterValue,
      placeholder: emptyValue || focused || modelValue.length ? undefined : placeholder,
      emptyValue: undefined,
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
        :model-value="!emptyValue || modelValue.length !== 0 ? modelValue : emptyValue"
        :disabled="isDisabled"
        :loading="loading || isFetchingPrefix"
        :option-component="(optionComponent as SelectOptionComponent<Data>)"
        :option-component-props="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
        :disable-clear="disableClear || isReadonly || (seamless && !focused) || modelValue.length === 0"
        :preview-data="previewData"
        :created-data="createdData"
        :value-getter="valueGetter"
        :value-query-key="valueQueryKey"
        :readonly="isReadonly"
        @unselect="unselect"
        @update:fetching="!$event && updateDropdown(); isFetchingPrefix = $event"
        @update:model-value="updateSelected"
      >
        <template
          v-if="$slots.option"
          #option="{option, index, skeleton: skeletonOption}"
        >
          <slot
            name="option"
            :option="option"
            :index="index"
            :selected="true"
            :model="true"
            :skeleton="skeletonOption"
            :search="undefined"
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
        :disabled="isDisabledComputed"
        :empty-stub="!search && emptyStub ? emptyStub : undefined"
        :allow-create="createOption && (!hasSearchOption || isModelValueSearch)"
        :hide-option-icon="hideOptionIcon"
        :value-getter="valueGetter"
        :loading-create="loadingCreate"
        :search="search"
        class="max-h-80"
        @select="select"
        @unselect="unselect"
        @create:option="create(search)"
        @update:model-value="updateSelected"
      >
        <template #default="{option, selected, skeleton: skeletonList, index}">
          <slot
            name="option"
            :option="option"
            :selected="selected"
            :skeleton="skeletonList"
            :model="false"
            :search="search"
            :index="index"
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
import type {SelectAsyncProps, SelectOptionComponent, SelectOptionComponentProps, SelectOptionProps} from './types'

import {computed, nextTick, ref, useTemplateRef, watch} from 'vue'

import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import {useIsMobile} from '@/utils/mobile'
import {useComponentStates} from '@/utils/useComponentStates'

import SelectAsyncList from './components/SelectAsyncList.vue'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectAsyncProps<Model, Data, QueryParams, OptionComponent>>(),
  {
    emptyStub: 'No match',
    valueGetter: (data: Data) => (data as unknown as {id: Model}).id,
    valueQueryKey: 'id__in',
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'select', item: Model): void
  (e: 'unselect', item: Model): void
  (e: 'update:model-value', value: Model[]): void
  (e: 'init-model'): void
  (e: 'focus', value: FocusEvent | undefined): void
  (e: 'blur', value: FocusEvent): void
}>()

const {isReadonly, isDisabled} = useComponentStates(props)

const {isMobile} = useIsMobile()

const isOpen = ref(false)
const inputRef = useTemplateRef('input')
const listRef = useTemplateRef('list')
const focused = ref(false)
const isFetchingPrefix = ref(false)
const search = ref('')
const loadingCreate = ref(false)

const isDisabledComputed = computed(() => props.loading || isReadonly.value || isDisabled.value)
const isModelValueSearch = computed(() => !!search.value && props.modelValue.includes(search.value as Model))
const queryParams = computed(() => ({...props.queryParamsOptions, [props.searchField ?? 'search']: search.value}))
const queryParamsFirstPage = computed(() => ({...queryParams.value, page: 1}))

const {data: firstPageData} = props.useQueryFnOptions(queryParamsFirstPage)

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
    else if (search.value) create(search.value)
    else if (props.modelValue.length) unselect(props.modelValue[props.modelValue.length - 1])
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
  if (isDisabledComputed.value) return

  emit('select', item)

  search.value = ''
}

const unselect = (item: Model): void => {
  if (isDisabledComputed.value) return

  emit('unselect', item)

  search.value = ''
}

const create = async (value: string) => {
  if (isDisabledComputed.value) return
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
  if (isDisabledComputed.value) return

  emit('update:model-value', value)

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
  const {data: defaultData} = props.useQueryFnDefault({enabled: computed(() => !props.disabled)})

  watch(defaultData, value => {
    if (value && props.modelValue.length === 0) {
      select(props.valueGetter(value))
      emit('init-model')
    }
  }, {immediate: true})
}

watch(() => props.modelValue, async () => {
  await nextTick()

  inputRef.value?.updateDropdown()

  if (props.seamless) inputRef.value?.scrollToInput()
})

defineExpose({
  focus,
  blur,
  setSearch,
})

defineSlots<{
  title?: () => void
  subtitle?: () => void
  right?: (props: Record<string, never>) => void
  option?: (props: PartialNot<SelectOptionProps<Data>>) => void
}>()
</script>
