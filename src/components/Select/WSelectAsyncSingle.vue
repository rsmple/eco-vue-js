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
      emptyValue: props.emptyValue !== undefined && props.emptyValue !== null ? [props.emptyValue] : undefined,
    }"
    :class="$attrs.class"
    @select="updateModelValue"
    @unselect="(value, data) => allowClear && updateModelValue(null as EmitType, data)"
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
  </WSelectAsync>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false">
import type {SelectAsyncSingleProps, SelectOptionComponent, SelectOptionProps} from './types'

import {computed, toRef, useTemplateRef, watch} from 'vue'

import WSelectAsync from '@/components/Select/WSelectAsync.vue'

type EmitType = AllowClear extends true ? Model | null : NonNullable<Model>

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectAsyncSingleProps<Model, Data, QueryParams, OptionComponent, AllowClear>>(),
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

const arrayValue = computed<Model[]>(() => props.modelValue ? [props.modelValue] : [])

const updateModelValue = (value: Model | null, data: Data | undefined): void => {
  emit('update:model-value', value as EmitType, data)
}

const blur = () => {
  selectComponentRef.value?.blur()
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
})

defineSlots<{
  title?: () => void
  subtitle?: () => void
  right?: (props: Record<string, never>) => void
  option?: (props: PartialNot<SelectOptionProps<Data>>) => void
  content?: () => void
}>()
</script>
