<template>
  <WSelect
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      disableClear: !allowClear,
      createdData: createdData ? [createdData] as Data[] : undefined,
      hidePrefix: true,
      filterValue: filterValue === undefined ? modelValue : filterValue,
      selectOnClose: props.searchModel ? props.searchModel : props.selectOnClose,
    }"
    :class="$attrs.class"
    @select="updateModelValue($event)"
    @unselect="updateModelValue(allowClear ? null : $event)"
    @focus="searchModel && typeof modelValue === 'string' ? selectComponentRef?.setSearch(modelValue) : undefined"
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
  </WSelect>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false">
import type {SelectOptionComponent, SelectOptionProps, SelectSingleProps} from './types'

import {type VNode, computed, toRef, useTemplateRef, watch} from 'vue'

import WSelect from '@/components/Select/WSelect.vue'

type EmitType = AllowClear extends true ? Model | null : NonNullable<Model>

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectSingleProps<Model, Data, QueryParamsOptions, OptionComponent, AllowClear>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: EmitType): void
  (e: 'update:query-options-error', value: string | undefined): void
  (e: 'init-model'): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const arrayValue = computed<Model[]>(() => props.modelValue !== null && props.modelValue !== '' ? [props.modelValue] : [])

const updateModelValue = (value: Model | null): void => {
  emit('update:model-value', value as EmitType)

  blur()
}

const blur = () => {
  selectComponentRef.value?.blur()
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
})

defineSlots<{
  title?: () => VNode[]
  subtitle?: () => VNode[]
  right?: () => VNode[]
  option?: (props: PartialNot<SelectOptionProps<Data>>) => VNode[]
}>()
</script>
