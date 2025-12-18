<template>
  <WSelect
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      filterValue: filterValue === undefined ? arrayValue : filterValue,
      createdData: createOption ? arrayValue.map(createOption) : undefined,
      emptyValue: arrayValueEmpty,
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
  </WSelect>
</template>

<script lang="ts" setup generic="Model extends string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectOptionComponent, SelectOptionProps, SelectStringifiedProps} from './types'

import {type VNode, computed, useTemplateRef} from 'vue'

import WSelect from '@/components/Select/WSelect.vue'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectStringifiedProps<Model, Data, QueryParamsOptions, OptionComponent>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: Model): void
  (e: 'update:query-options-error', value: string | undefined): void
  (e: 'init-model'): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const decodeValue = (value: string | null): string[] => {
  if (!value) return []

  if (props.divider !== 'json') return value.split(props.divider).filter((item, index, arr) => item !== '' && arr.indexOf(item) === index)

  const result: string[] = []

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return result
    for (const item in parsed) {
      if (typeof item === 'string' && item !== '' && !result.includes(item)) result.push(item)
    }
    return result
  } catch {
    return result
  }
}

const encodeValue = (value: string[]): string => {
  return props.divider === 'json' ? JSON.stringify(value) : value.join(props.divider)
}

const arrayValue = computed<string[]>(() => decodeValue(props.modelValue))

const arrayValueEmpty = computed<string[] | undefined>(() => props.emptyValue ? decodeValue(props.emptyValue) : undefined)

const updateModelValue = (value: string, isSelect: boolean): void => {
  const valueList = value.split(props.divider)

  let newValue: string

  if (isSelect) {
    newValue = [...arrayValue.value, ...valueList].filter((item, index, arr) => item !== '' && arr.indexOf(item) === index).join(props.divider)
  } else {
    newValue = encodeValue(arrayValue.value.filter(item => !valueList.includes(item)))
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
  option?: (props: PartialNot<SelectOptionProps<Data>>) => VNode[]
  content?: () => VNode[]
}>()
</script>
