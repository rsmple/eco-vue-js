<template>
  <SelectDeferred
    v-if="isDeferred"
    :model-value="arrayValue"
    :get-option="getOption"
    :field="deferredField"
    :option-component="optionComponent"
    :option-component-props="optionComponentProps"
    :placeholder="placeholder"
    :placeholder-empty="placeholderEmpty"
    :name="name"
    :size="size"
    :no-wrap="noWrap"
    :border-class="borderClass"
    :hide-input="hideInput"
    :loading="loading"
    :class="$attrs.class"
    @activate="activate"
  >
    <template
      v-if="$slots.option"
      #option="scope"
    >
      <slot
        name="option"
        v-bind="scope"
      />
    </template>
  </SelectDeferred>

  <WSelect
    v-else
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      disableClear: !allowClear,
      createdData: createdDataList,
      hidePrefix: true,
      cursorSelected: true,
      filterValue: filterValue === undefined ? modelValue : filterValue,
    }"
    :class="$attrs.class"
    @select="updateModelValue"
    @unselect="(value, data) => allowClear && updateModelValue(getClearValue(), data)"
    @focus="searchModel && typeof modelValue === 'string' ? selectComponentRef?.setSearch(modelValue) : undefined; $emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @update:query-options-error="$emit('update:query-options-error', $event)"
    @init-model="$emit('init-model')"
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

    <template
      v-if="$slots.option"
      #option="scope"
    >
      <slot
        name="option"
        v-bind="scope"
      />
    </template>

    <template
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>

    <template
      v-if="$slots.prefix"
      #prefix
    >
      <slot name="prefix" />
    </template>

    <template
      v-if="$slots.content"
      #content
    >
      <slot name="content" />
    </template>
  </WSelect>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false, ClearValue extends SelectClearValue = null">
import type {SelectClearValue, SelectOptionComponent, SelectOptionProps, SelectSingleProps} from './types'

import {type VNode, computed, nextTick, ref, toRef, useTemplateRef, watch} from 'vue'

import WSelect from '@/components/Select/WSelect.vue'

import {useClearValue} from '@/utils/useClearValue'

import SelectDeferred from './components/SelectDeferred.vue'
import {getDeferredField} from './models/getDeferredField'
import {useCloseOnPick} from './models/useCloseOnPick'

type EmitType = AllowClear extends true ? Model | ClearValue : NonNullable<Model>

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectSingleProps<Model, Data, QueryParamsOptions, OptionComponent, AllowClear, ClearValue>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  /** The new value, with its option — `clearValue` when cleared. */
  (e: 'update:model-value', value: EmitType, data: Data | undefined): void
  /** Error detail from a failed `useQueryFnOptions`, or `undefined` once it loads. */
  (e: 'update:query-options-error', value: string | undefined): void
  /** A default value was selected by `useQueryFnDefault` or `useFirstDefault`. */
  (e: 'init-model'): void
  /** The field was focused. */
  (e: 'focus', value: FocusEvent | undefined): void
  /** The field lost focus. */
  (e: 'blur', value: FocusEvent): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const getClearValue = useClearValue(props)

const arrayValue = computed<Model[]>(() => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '' ? [props.modelValue] : [])

const createdDataList = computed<Data[] | undefined>(() => {
  const list = [props.createdData, props.previewData].filter(item => item !== undefined)

  return list.length ? list : undefined
})

// A default option is selected on mount, so a select with one mounts at once.
const isActive = ref(!props.deferred || !props.seamless || !!props.useQueryFnDefault || !!props.useFirstDefault)

const isDeferred = computed(() => !isActive.value && props.deferred)

const deferredField = computed(() => {
  const field = getDeferredField(props)

  if (props.filterField && props.filterValue === undefined) field.filterValue = props.modelValue

  return field
})

const getOption = (value: Model): Data | undefined => {
  return props.options?.find(option => props.valueGetter(option) === value)
    ?? createdDataList.value?.find(option => props.valueGetter(option) === value)
}

const activate = async () => {
  if (isActive.value) return

  isActive.value = true

  await nextTick()

  focus()
}

const closeOnPick = useCloseOnPick(() => props.embedded ?? false, () => selectComponentRef.value?.close())

const updateModelValue = (value: Model | ClearValue, data: Data | undefined): void => {
  emit('update:model-value', value as EmitType, data)

  blur()
  closeOnPick()
}

const blur = () => {
  selectComponentRef.value?.blur()
}

const focus = () => {
  if (isActive.value) selectComponentRef.value?.focus()
  else activate()
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
  focus,
})

defineSlots<{
  /** Replaces the `title` text. */
  title?: () => VNode[]
  /** Content between the title and the field. */
  subtitle?: () => VNode[]
  /** Content to the right of the field. */
  right?: () => VNode[]
  /** Replaces the selected chips. */
  prefix?: () => VNode[]
  /** Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. */
  option?: (props: PartialNot<SelectOptionProps<Data>>) => VNode[]
  /** Content at the top of the menu, above the options. */
  content?: () => VNode[]
}>()
</script>
