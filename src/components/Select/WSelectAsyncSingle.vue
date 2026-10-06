<template>
  <WSelectAsync
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      disableClear: !allowClear,
      previewData: previewData ? [previewData] as Data[] : undefined,
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
      v-if="$slots.content"
      #content
    >
      <slot name="content" />
    </template>

    <template
      v-if="$slots.prefix"
      #prefix
    >
      <slot name="prefix" />
    </template>
  </WSelectAsync>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false, ClearValue extends SelectClearValue = null">
import type {SelectAsyncSingleProps, SelectClearValue, SelectOptionComponent, SelectOptionProps} from './types'

import {computed, toRef, useTemplateRef, watch} from 'vue'

import WSelectAsync from '@/components/Select/WSelectAsync.vue'

import {useClearValue} from './models/useClearValue'
import {useCloseOnPick} from './models/useCloseOnPick'

type EmitType = AllowClear extends true ? Model | ClearValue : NonNullable<Model>

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectAsyncSingleProps<Model, Data, QueryParams, OptionComponent, AllowClear, ClearValue>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  /** The new value, with its option — `clearValue` when cleared. */
  (e: 'update:model-value', value: EmitType, data: Data | undefined): void
  /** A default value was selected by `useQueryFnDefault`. */
  (e: 'init-model'): void
  /** The field was focused. */
  (e: 'focus', value: FocusEvent | undefined): void
  /** The field lost focus. */
  (e: 'blur', value: FocusEvent): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const getClearValue = useClearValue(props)

const arrayValue = computed<Model[]>(() => props.modelValue ? [props.modelValue] : [])

const closeOnPick = useCloseOnPick(() => props.embedded ?? false, () => selectComponentRef.value?.close())

const updateModelValue = (value: Model | ClearValue, data: Data | undefined): void => {
  emit('update:model-value', value as EmitType, data)

  closeOnPick()
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
  title?: () => void
  /** Content between the title and the field. */
  subtitle?: () => void
  /** Content to the right of the field. */
  right?: (props: Record<string, never>) => void
  /** Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. */
  option?: (props: PartialNot<SelectOptionProps<Data>>) => void
  /** Content at the top of the menu, above the options. */
  content?: () => void
  /** Replaces the selected chips. */
  prefix?: () => void
}>()
</script>
