<template>
  <WInputSuggest
    ref="input"
    v-bind="{
      ...props,
      modelValue: search,
      hideInput: modelValue.length === 0 ? false : isMobile ? !focused : !isOpen,
      loading: loading || isLoading || loadingCreate,
    }"
    :class="$attrs.class"
    @update:model-value="!loading && !isLoading && (search = $event as string ?? '')"

    @keypress:enter.stop.prevent="selectCursor"
    @keypress:up.prevent="cursorUp"
    @keypress:down.prevent="cursorDown"
    @keypress:delete="captureDoubleDelete"

    @open="isOpen = true"
    @close="close(); search = ''"
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
          v-for="(option, index) in prefixList"
          :key="valueGetter(option)"
          :option="option"
          :option-component="(optionComponent as SelectOptionComponent<Data>)"
          :option-component-props="(optionComponentProps as SelectProps<Model, Data, QueryParamsOptions, OptionComponent>['optionComponentProps'])"
          :index="index"
          :loading="loading || isLoading"
          :disabled="disabled"
          :disable-clear="disableClear || readonly"
          @unselect="unselect(valueGetter(option))"
        >
          <template #option>
            <slot
              name="option"
              :option="option"
              :selected="true"
              :model="true"
              :index="index"
            />
          </template>
        </SelectOptionPrefix>
      </template>
    </template>

    <template
      v-if="$slots.right?.()?.length"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <div
        v-if="!optionsFiltered.length"
        class="py-2 px-[1.0625rem] first:pt-4 last:pb-4"
      >
        <div class="select-none cursor-default w-select-field sm-not:px-3">
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
        class="first:pt-4 last:pb-4"
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

      <SelectOption
        v-if="hasCreateOption"
        :is-selected="false"
        :is-cursor="cursor === optionsFiltered.length"
        :loading="(loadingCreate || loadingOptionIndex === optionsFiltered.length) && loading"
        :scroll="isCursorLocked"
        :hide-option-icon="hideOptionIcon"
        class="first:pt-4 last:pb-4"
        @select="create(search)"
        @mouseenter="setCursor(optionsFiltered.length)"
      >
        <template #prefix>
          <span class="w-select-field pr-2 sm-not:px-3">
            Create:
          </span>
        </template>

        <slot
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
      </SelectOption>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>">
import {ref, watch, toRef, nextTick, computed, type Ref} from 'vue'
import SelectOption from './components/SelectOption.vue'
import SelectOptionPrefix from './components/SelectOptionPrefix.vue'
import {getIsMobile} from '@/utils/mobile'
import {debounce} from '@/utils/utils'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import type {SelectProps, SelectOptionComponent, SelectOptionComponentProps} from './types'
import {ApiError} from '@/utils/api'

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

const isOpen = ref(false)
const input = ref<ComponentInstance<typeof WInputSuggest<'text'>> | undefined>()
const cursor = ref<number>(0)
const isCursorLocked = ref(false)
const search = ref('')
const searchPrepared = computed(() => search.value.trim().toLocaleLowerCase())
const enabled = computed(() => !props.disabled)

const {data, isLoading, error: queryError} = props.useQueryFnOptions
  ? !props.queryParamsOptions
    ? (props.useQueryFnOptions as UseQueryEmpty<Data[]>)({enabled})
    : props.useQueryFnOptions(toRef(props, 'queryParamsOptions'), {enabled})
  : {
    data: toRef(props, 'options') as Ref<Data[] | undefined>,
    isLoading: ref(false),
    error: ref(undefined),
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
const isMobile = getIsMobile()
const focused = ref(false)
const loadingOptionIndex = ref<number | null>(null)
const loadingCreate = ref(false)

const isDisabled = computed(() => props.loading || props.readonly || props.disabled)

const prefixList = computed(() => props.modelValue.map(value => optionsWithCreated.value?.find(item => props.valueGetter(item) === value)).filter(item => item !== undefined))

const hasCreateOption = computed(() => props.createOption && search.value !== '' && !optionsFiltered.value.some(option => props.valueGetter(option) === search.value))

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
  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
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

  input.value?.updateDropdown()
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
    option: Data | null
    index?: number
    selected: boolean
    model: boolean
    search?: string
  }) => void,
  right?: () => void
}>()

</script>
