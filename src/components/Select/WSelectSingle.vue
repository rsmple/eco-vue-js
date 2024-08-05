<template>
  <WSelect
    ref="selectComponent"
    v-bind="{
      ...props,
      modelValue: arrayValue,
      disableClear: !allowClear,
      hidePrefix: true,
    }"
    :class="$attrs.class"
    @select="updateModelValue($event as Option)"
    @unselect="updateModelValue(allowClear ? null : ($event as Option))"
    @update:search="emit('update:search', $event)"
    @create:option="createOption($event)"
    @focus="searchModel && typeof modelValue === 'string' ? $emit('update:search', modelValue) : undefined"
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

    <template #option="{option, selected, model}">
      <slot
        name="option"
        :option="option"
        :selected="selected"
        :model="model"
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

<script lang="ts" setup generic="Option extends string | number, AllowClear extends boolean = false">
import {computed, ref, toRef, watch} from 'vue'
import WSelect from '@/components/Select/WSelect.vue'
import type {SelectSingleProps} from './types'

type EmitType = AllowClear extends true ? Option | null : NonNullable<Option>

defineOptions({inheritAttrs: false})

const props = defineProps<SelectSingleProps<Option, AllowClear>>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: EmitType): void
  (e: 'update:search', value: string): void
  (e: 'create:option', value: string): void
}>()

const selectComponent = ref<ComponentInstance<typeof WSelect<Option>> | undefined>()

const arrayValue = computed<Option[]>(() => props.modelValue !== null ? [props.modelValue] : [])

const updateModelValue = (value: Option | null): void => {
  emit('update:modelValue', value as EmitType)

  blur()
}

const createOption = (value: string): void => {
  emit('create:option', value)
}

const blur = () => {
  selectComponent.value?.blur()
  emit('update:search', '')
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
})

</script>
