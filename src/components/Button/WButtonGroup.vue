<template>
  <WFieldWrapper
    v-bind="props"
    :class="$attrs.class"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template #field>
      <div
        class="flex"
        :class="{
          'flex-wrap gap-2': wrap,
          'flex-col gap-2': col,
          'items-start': col && !stretch,
        }"
      >
        <WButton
          v-for="(item, index) in list"
          :key="index"
          :semantic-type="getValue(item as Model | Entity) === modelValue ? semanticType ?? SemanticType.PRIMARY : SemanticType.SECONDARY"
          :loading="getValue(item as Model | Entity) === loading"
          :disabled="disabled || (loading !== undefined && getValue(item as Model | Entity) !== loading)"
          :minimize="minimize"
          :join="!wrap && !col"
          :class="{
            'flex-1': stretch,
          }"
          @click="updateModelValue(getValue(item as Model | Entity))"
        >
          <slot
            name="option"
            :option="(item as ValueGetter extends undefined ? Model : Entity)"
            :selected="getValue(item) === modelValue"
          >
            <component
              :is="optionComponent"
              v-if="optionComponent"
              :option="item"
              :selected="getValue(item) === modelValue"
            />
          </slot>
        </WButton>
      </div>
    </template>

    <template 
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>
  </WFieldWrapper>
</template>

<script lang="ts" setup generic="Model extends number | string | null | boolean, Entity extends Record<string, unknown>, ValueGetter extends {fn(value: Entity): Model}['fn'] | undefined = undefined">
import type {ButtonGroupProps} from './types'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import {SemanticType} from '@/utils/SemanticType'

import WButton from './WButton.vue'

defineOptions({inheritAttrs: false})

const props = defineProps<ButtonGroupProps<Model, Entity, ValueGetter>>()

const emit = defineEmits<{
  (e: 'update:model-value', value: Model): void
}>()

const getValue = (item: Model | Entity): Model => {
  if (props.valueGetter && typeof item === 'object') {
    return props.valueGetter(item as Entity)
  } else {
    return item as Model
  }
}

const updateModelValue = (value: Model): void => {
  if (value !== props.modelValue) emit('update:model-value', value)
  else if (props.allowClear) emit('update:model-value', null as Model)
}
</script>