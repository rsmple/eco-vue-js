<template>
  <WSelect
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      disableClear: !allowClear,
      createdData: createdData ? [createdData] as Data[] : undefined,
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

import {type VNode, computed, toRef, useTemplateRef, watch} from 'vue'

import WSelect from '@/components/Select/WSelect.vue'

import {useClearValue} from './models/useClearValue'

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

const updateModelValue = (value: Model | ClearValue, data: Data | undefined): void => {
  emit('update:model-value', value as EmitType, data)

  blur()
}

const blur = () => {
  selectComponentRef.value?.blur()
}

const focus = () => {
  selectComponentRef.value?.focus()
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
