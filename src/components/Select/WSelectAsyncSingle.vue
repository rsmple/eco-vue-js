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
      filterValue: filterValue === undefined ? modelValue : filterValue,
      selectOnClose: props.searchModel ? props.searchModel : props.selectOnClose,
    }"
    :class="$attrs.class"
    @select="updateModelValue"
    @unselect="(value, data) => allowClear && updateModelValue(getClearValue(), data)"
    @focus="searchModel && typeof modelValue === 'string' ? selectComponentRef?.setSearch(modelValue) : undefined"
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
  (e: 'update:model-value', value: EmitType, data: Data | undefined): void
  (e: 'init-model'): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const getClearValue = useClearValue(props)

const arrayValue = computed<Model[]>(() => props.modelValue ? [props.modelValue] : [])

const updateModelValue = (value: Model | ClearValue, data: Data | undefined): void => {
  emit('update:model-value', value as EmitType, data)
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
  title?: () => void
  subtitle?: () => void
  right?: (props: Record<string, never>) => void
  option?: (props: PartialNot<SelectOptionProps<Data>>) => void
  content?: () => void
  prefix?: () => void
}>()
</script>
