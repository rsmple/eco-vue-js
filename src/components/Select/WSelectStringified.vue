<template>
  <WSelect
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
    }"
    :class="$attrs.class"
    @select="updateModelValue($event, true)"
    @unselect="updateModelValue($event, false)"
    @update:query-options-error="$emit('update:query-options-error', $event)"
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
import {computed, ref, toRef, watch} from 'vue'
import WSelect from '@/components/Select/WSelect.vue'
import type {SelectStringifiedProps, SelectOptionComponent} from './types'

defineOptions({inheritAttrs: false})

const props = defineProps<SelectStringifiedProps<Model, Data, QueryParamsOptions, OptionComponent>>()

const emit = defineEmits<{
  (e: 'update:model-value', value: Model | null): void
  (e: 'update:query-options-error', value: string | undefined): void
}>()

const selectComponent = ref<ComponentInstance<typeof WSelect<Model, Data, QueryParamsOptions, OptionComponent>> | undefined>()

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
  selectComponent.value?.blur()
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
})

</script>
