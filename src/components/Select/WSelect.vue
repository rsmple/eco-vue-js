<template>
  <WInputSuggest
    ref="input"
    v-bind="{
      ...props,
      modelValue: search,
      hideInput: modelValue.length === 0 ? false : isMobile ? !focused : !isOpen,
      loading: loading || isLoading || loadingCreate,
      filterValue: filterValue === undefined ? modelValue : filterValue,
      placeholder: placeholder ?? (modelValue.length === 0 ? emptyValue : undefined),
    }"
    :class="$attrs.class"
    @update:model-value="!loading && !isLoading && (search = $event as string ?? '')"

    @keypress:enter.stop.prevent="selectCursor"
    @keypress:up.prevent="cursorUp"
    @keypress:down.prevent="cursorDown"
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
      <template v-if="hidePrefix ? isMobile ? (unclickable || !focused) : !isOpen : true">
        <SelectOptionPrefix
          v-for="(value, index) in modelValue"
          :key="value"
          :option="optionsWithCreated.find(item => valueGetter(item) === value)"
          :option-component="(optionComponent as SelectOptionComponent<Data>)"
          :option-component-props="(optionComponentProps as SelectProps<Model, Data, QueryParamsOptions, OptionComponent>['optionComponentProps'])"
          :index="index"
          :loading="loading || isLoading"
          :disabled="disabled"
          :readonly="readonly"
          :disable-clear="disableClear || readonly || (seamless && !focused)"
          :search="value"
          @unselect="unselect(value)"
        >
          <template
            v-if="$slots.option"
            #option="optionScope"
          >
            <slot
              name="option"
              v-bind="optionScope"
              :selected="true"
              :model="true"
              :index="index"
            />
          </template>
        </SelectOptionPrefix>
      </template>
    </template>

    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <SelectOption
        v-if="hasCreateOption"
        :is-selected="false"
        :is-cursor="cursor === optionsFiltered.length"
        :loading="(loadingCreate || loadingOptionIndex === optionsFiltered.length) && loading"
        :scroll="isCursorLocked"
        :hide-option-icon="hideOptionIcon"
        :disabled="!search || isModelValueSearch"
        class="first:-pt--w-select-option-padding last:-pb--w-select-option-padding"
        @select="create(search)"
        @mouseenter="setCursor(optionsFiltered.length)"
      >
        <template #prefix>
          <div class="w-option flex items-center pr-2">
            Create:
          </div>
        </template>

        <slot
          v-if="search && !isModelValueSearch"
          name="option"
          :option="null"
          :search="search"
          :selected="false"
          :model="false"
        >
          <component
            v-bind="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
            :is="optionComponent"
            :option="null"
            :search="search"
            :selected="false"
            :model="false"
          />
        </slot>

        <div
          v-else
          class="text-description w-option flex items-center"
        >
          Start typing..
        </div>
      </SelectOption>

      <div
        v-if="!optionsFiltered.length && !isModelValueSearch && (!createOption || optionsWithCreated.length)"
        class="w-select-option first:-pt--w-select-option-padding last:-pb--w-select-option-padding"
      >
        <div class="w-option flex cursor-default select-none items-center">
          {{ !search && emptyStub ? emptyStub : 'No match' }}
        </div>
      </div>

      <SelectOption
        v-for="(option, index) in optionsFiltered"
        :key="valueGetter(option)"
        :is-selected="modelValue.includes(valueGetter(option))"
        :is-cursor="index === cursor"
        :loading="loadingOptionIndex === index && loading"
        :scroll="isCursorLocked"
        :hide-option-icon="hideOptionIcon"
        class="first:-pt--w-select-option-padding last:-pb--w-select-option-padding"
        @select="select(valueGetter(option)); setLoadingOptionIndex(index)"
        @unselect="unselect(valueGetter(option)); setLoadingOptionIndex(index)"
        @mouseenter="setCursor(index)"
      >
        <template #default="{selected}">
          <slot
            name="option"
            :option="option"
            :selected="selected"
            :model="false"
          >
            <component
              v-bind="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
              :is="optionComponent"
              :option="option"
              :selected="selected"
              :model="false"
            />
          </slot>
        </template>
      </SelectOption>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectOptionComponent, SelectOptionComponentProps, SelectProps} from './types'

import {type Ref, computed, nextTick, ref, toRef, useTemplateRef, watch} from 'vue'

import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import {ApiError} from '@/utils/api'
import {useIsMobile} from '@/utils/mobile'
import {debounce} from '@/utils/utils'

import SelectOption from './components/SelectOption.vue'
import SelectOptionPrefix from './components/SelectOptionPrefix.vue'

defineOptions({inheritAttrs: false})

const props = defineProps<SelectProps<Model, Data, QueryParamsOptions, OptionComponent>>()

const emit = defineEmits<{
  (e: 'select', item: Model): void
  (e: 'unselect', item: Model): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
  (e: 'update:query-options-error', value: string | undefined): void
  (e: 'init-model'): void
}>()

const {isMobile} = useIsMobile()

const isOpen = ref(false)
const inputRef = useTemplateRef('input')
const cursor = ref<number>(0)
const isCursorLocked = ref(false)
const search = ref('')
const isModelValueSearch = computed(() => !!search.value && props.modelValue.includes(search.value as Model))
const searchPrepared = computed(() => isModelValueSearch.value ? '' : search.value.trim().toLocaleLowerCase())
const enabled = computed(() => !props.disabled)

const {data, isLoading, error: queryError} = props.useQueryFnOptions
  ? props.queryParamsOptions === undefined
    ? (props.useQueryFnOptions as UseQueryEmpty<Data[]>)({enabled})
    : props.useQueryFnOptions(toRef(props, 'queryParamsOptions'), {enabled})
  : {
    data: toRef(props, 'options') as Ref<Data[] | undefined>,
    isLoading: ref(false),
    error: ref<ApiError | undefined>(undefined),
  }

const createdOptions = ref([]) as Ref<Data[]>
const optionsPrepared = computed(() => !data.value ? [] : props.filterOptions ? data.value.filter(option => props.filterOptions?.(option) ?? true) : data.value)
const optionsWithCreated = computed(() => {
  if (!props.createdData) {
    if (!createdOptions.value.length) return optionsPrepared.value
    else return [
      ...optionsPrepared.value,
      ...createdOptions.value,
    ].filter((option, index, array) => array.findIndex(item => props.valueGetter(item) === props.valueGetter(option)) === index)
  }

  return [
    ...optionsPrepared.value,
    ...props.createdData ?? [],
    ...createdOptions.value,
  ].filter((option, index, array) => array.findIndex(item => props.valueGetter(item) === props.valueGetter(option)) === index)
})

const optionsFiltered = computed(() => searchPrepared.value === '' ? optionsWithCreated.value : optionsWithCreated.value.filter(option => props.searchFn(option, searchPrepared.value)))
const lastIndex = computed(() => props.createOption ? optionsFiltered.value.length : optionsFiltered.value.length - 1)
const focused = ref(false)
const loadingOptionIndex = ref<number | null>(null)
const loadingCreate = ref(false)

const isDisabled = computed(() => props.loading || props.readonly || props.disabled)

const hasCreateOption = computed(() => props.createOption && (!optionsFiltered.value.some(option => props.valueGetter(option) === search.value) || isModelValueSearch.value))

const close = () => {
  if (props.selectOnClose && focused.value && !isModelValueSearch.value) {
    const optionExact = optionsFiltered.value.find(option => props.valueGetter(option) === search.value)

    if (optionExact) select(props.valueGetter(optionExact))
    else if (search.value) create(search.value)
    else if (props.modelValue.length) unselect(props.modelValue[props.modelValue.length - 1])
  }

  isOpen.value = false
  focused.value = false
  search.value = ''
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

const cursorUp = () => {
  if (isDisabled.value) return

  lockCursor()

  cursor.value = !optionsFiltered.value.length
    ? 0
    : cursor.value < 1
      ? lastIndex.value
      : cursor.value - 1
}

const cursorDown = () => {
  if (isDisabled.value) return

  lockCursor()

  cursor.value = !optionsFiltered.value.length
    ? 0
    : cursor.value >= lastIndex.value
      ? 0
      : cursor.value + 1
}

const selectCursor = () => {
  if (isDisabled.value) return

  if (cursor.value === optionsFiltered.value.length) {
    if (search.value && props.createOption) create(search.value)

    return
  }

  const option = cursor.value !== -1 ? optionsFiltered.value[cursor.value] : undefined

  const value = option ? props.valueGetter(option) : undefined

  if (!value) return

  setLoadingOptionIndex(cursor.value)

  if (props.modelValue.includes(value)) unselect(value)
  else select(value)
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

  const index = createdOptions.value.findIndex(option => props.valueGetter(option) === item)

  if (index !== -1) createdOptions.value.splice(index, 1)
}

const create = async (value: string) => {
  if (isDisabled.value) return
  if (!props.createOption) return

  loadingCreate.value = true

  const option = await props.createOption(value)

  if (option) {
    createdOptions.value.push(option as Data)
    setLoadingOptionIndex(optionsFiltered.value.length)
    select(props.valueGetter(option))

    search.value = ''
  }

  loadingCreate.value = false
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  focused.value = false

  inputRef.value?.blur()
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

watch(() => props.modelValue, async () => {
  await nextTick()

  inputRef.value?.updateDropdown()

  if (props.seamless) inputRef.value?.scrollToInput()
})

watch(queryError, error => {
  if (error instanceof ApiError && error.response?.data?.detail) {
    emit('update:query-options-error', error.response.data.detail)
  } else {
    emit('update:query-options-error', undefined)
  }
}, {immediate: true})

watch(() => optionsFiltered.value.length, length => {
  if (length < cursor.value) cursor.value = length
})

defineExpose({
  focus,
  blur,
  setSearch,
})

defineSlots<{
  title?: () => void
  subtitle?: () => void
  option?: (props: {
    option: Data | null | undefined
    index?: number
    selected: boolean
    model: boolean
    search?: string
  }) => void
  right?: () => void
}>()
</script>
