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
    }"
    :class="$attrs.class"
    @select="updateModelValue($event as EmitType)"
    @unselect="allowClear && updateModelValue(null as EmitType)"
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
  </WSelectAsync>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>, AllowClear extends boolean = false">
import {computed, ref, toRef, watch} from 'vue'
import WSelectAsync from '@/components/Select/WSelectAsync.vue'
import type {SelectAsyncSingleProps, SelectOptionComponent} from './types'

type EmitType = AllowClear extends true ? Model | null : NonNullable<Model>

defineOptions({inheritAttrs: false})

const props = defineProps<SelectAsyncSingleProps<Model, Data, QueryParams, OptionComponent, AllowClear>>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: EmitType): void
  (e: 'init-model'): void
}>()

const selectComponent = ref<ComponentInstance<typeof WSelectAsync<Model, Data, QueryParams, OptionComponent>> | undefined>()

const arrayValue = computed<Model[]>(() => props.modelValue ? [props.modelValue] : [])

const updateModelValue = (value: EmitType): void => {
  emit('update:modelValue', value)
}

const blur = () => {
  selectComponent.value?.blur()
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
})

</script>
