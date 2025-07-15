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

    <template
      v-if="$slots.subtitle"
      #subtitle
    >
      <slot name="subtitle" />
    </template>

    <template
      v-if="readonly" 
      #default
    >
      <div class="flex gap-1">
        <slot
          v-if="modelValueItem !== undefined"
          name="option"
          :option="modelValueItem"
          :selected="true"
        >
          <component
            :is="optionComponent"
            v-if="optionComponent"
            :option="modelValueItem"
            :selected="true"
          />
        </slot>

        <template v-else>
          {{ emptyValue }}
        </template>
      </div>
    </template>

    <template
      v-else
      #field
    >
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
          v-bind="{
            ...props,
            semanticType: getValue(item as Model | Entity) === modelValue ? semanticType ?? SemanticType.PRIMARY : SemanticType.SECONDARY,
            loading: loading && getValue(item as Model | Entity) === loadingItem,
            disabled: isDisabled || isReadonly || (loading && getValue(item as Model | Entity) !== loadingItem),
            join: !wrap && !col,
            tooltipText: undefined,
          }"
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

import {computed, ref} from 'vue'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import {SemanticType} from '@/utils/SemanticType'
import {useComponentStates} from '@/utils/useComponentStates'

import WButton from './WButton.vue'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<ButtonGroupProps<Model, Entity, ValueGetter>>(),
  {
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:model-value', value: Model): void
}>()

const {isDisabled, isReadonly} = useComponentStates(props)

const loadingItem = ref<Model | undefined>(undefined)

const getValue = (item: Model | Entity): Model => {
  if (props.valueGetter && typeof item === 'object') {
    return props.valueGetter(item as Entity)
  } else {
    return item as Model
  }
}

const modelValueItem = computed(() => props.list.find(item => getValue(item) === props.modelValue))

const emitUpdateModelValue = (value: Model): void => {
  loadingItem.value = value

  emit('update:model-value', value)
}

const updateModelValue = (value: Model): void => {
  if (value !== props.modelValue) emitUpdateModelValue(value)
  else if (props.allowClear) emitUpdateModelValue(null as Model)
}
</script>