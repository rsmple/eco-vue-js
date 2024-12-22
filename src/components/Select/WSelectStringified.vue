<template>
  <WSelect
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      filterValue: filterValue === undefined ? arrayValue : filterValue,
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

    <template #option="{option, selected, model, search}">
      <slot
        name="option"
        :option="option"
        :selected="selected"
        :model="model"
        :search="search"
      />
    </template>

    <template
      v-if="$slots.right?.()?.length"
      #right
    >
      <slot name="right" />
    </template>
  </WSelect>
</template>

<script lang="ts" setup generic="Model extends string, Data extends DefaultData, QueryParamsOptions, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectOptionComponent, SelectStringifiedProps} from './types'

import {computed, useTemplateRef} from 'vue'

import WSelect from '@/components/Select/WSelect.vue'

defineOptions({inheritAttrs: false})

const props = defineProps<SelectStringifiedProps<Model, Data, QueryParamsOptions, OptionComponent>>()

const emit = defineEmits<{
  (e: 'update:model-value', value: Model | null): void
  (e: 'update:query-options-error', value: string | undefined): void
  (e: 'init-model'): void
}>()

const selectComponentRef = useTemplateRef('selectComponent')

const arrayValue = computed<string[]>(() => props.modelValue !== null ? props.modelValue.split(props.divider) : [])

const updateModelValue = (value: string, isSelect: boolean): void => {
  const valueList = value.split(props.divider)

  let newValue: string

  if (isSelect) {
    newValue = [...arrayValue.value, ...valueList].filter((item, index, arr) => arr.indexOf(item) === index).join(props.divider)
  } else {
    newValue = arrayValue.value.filter(item => !valueList.includes(item)).join(props.divider)
  }

  if (newValue === props.modelValue) return

  emit('update:model-value', newValue as Model || null)
}

const blur = () => {
  selectComponentRef.value?.blur()
}

defineExpose({
  blur,
})
</script>
