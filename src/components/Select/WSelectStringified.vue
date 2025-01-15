<template>
  <WSelect
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      filterValue: filterValue === undefined ? arrayValue : filterValue,
      createdData: createOption ? arrayValue.map(createOption) : undefined,
    }"
    :class="$attrs.class"
    @select="updateModelValue($event, true)"
    @unselect="updateModelValue($event, false)"
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
      #option="{option, selected, model, search}"
    >
      <slot
        name="option"
        :option="option"
        :selected="selected"
        :model="model"
        :search="search"
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

<script lang="ts" setup generic="Model extends string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectOptionComponent, SelectStringifiedProps} from './types'

import {type VNode, computed, useTemplateRef} from 'vue'

import WSelect from '@/components/Select/WSelect.vue'

defineOptions({inheritAttrs: false})

const props = defineProps<SelectStringifiedProps<Model, Data, QueryParamsOptions, OptionComponent>>()

const emit = defineEmits<{
  (e: 'update:model-value', value: Model): void
  (e: 'update:query-options-error', value: string | undefined): void
  (e: 'init-model'): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const arrayValue = computed<string[]>(() => props.modelValue !== null ? props.modelValue.split(props.divider).filter((item, index, arr) => item !== '' && arr.indexOf(item) === index) : [])

const updateModelValue = (value: string, isSelect: boolean): void => {
  const valueList = value.split(props.divider)

  let newValue: string

  if (isSelect) {
    newValue = [...arrayValue.value, ...valueList].filter((item, index, arr) => item !== '' && arr.indexOf(item) === index).join(props.divider)
  } else {
    newValue = arrayValue.value.filter(item => !valueList.includes(item)).join(props.divider)
  }

  if (newValue === props.modelValue) return

  emit('update:model-value', newValue as Model)
}

const blur = () => {
  selectComponentRef.value?.blur()
}

defineExpose({
  blur,
})

defineSlots<{
  title?: () => VNode[]
  subtitle?: () => VNode[]
  right?: () => VNode[]
  option?: (props: {option: Data | null, selected: boolean, model: boolean, search: string | undefined}) => VNode[]
}>()
</script>
