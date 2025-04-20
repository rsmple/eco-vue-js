<template>
  <WFieldWrapper
    v-bind="{
      ...props,
      modelValue: undefined as never,
    }"
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

    <template #field>
      <div
        :class="{
          'flex flex-wrap gap-x-4': wrap,
          'flex gap-x-4 [&>*]:flex-1': stretch,
        }"
      >
        <WCheckbox
          v-for="(item, index) in list"
          :key="index"
          v-bind="{
            ...props,
            modelValue: modelValue.includes(getValue(item)),
            title: titleMap?.[getValue(item)!.toString() as GroupModelStringified<Model>],
            tooltipText: tooltipTextMap?.[getValue(item)!.toString() as GroupModelStringified<Model>],
            icon: iconMap?.[getValue(item)!.toString() as GroupModelStringified<Model>],
            loading: loading && getValue(item as Model | Entity) === loadingItem,
            disabled: disabled || (loading && getValue(item as Model | Entity) !== loadingItem),
          }"
          :class="[classMap?.[getValue(item)!.toString() as GroupModelStringified<Model>], optionClass]"
          @update:model-value="emitUpdateModelValue(getValue(item as Model | Entity))"
        >
          <template
            v-if="$slots.option || optionComponent"
            #default
          >
            <slot
              name="option"
              :option="(item as ValueGetter extends undefined ? Model : Entity)"
              :selected="modelValue.includes(getValue(item))"
            >
              <component
                :is="optionComponent"
                v-if="optionComponent"
                :option="item"
                :selected="modelValue.includes(getValue(item))"
              />
            </slot>
          </template>
        </WCheckbox>
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
import type {CheckboxGroupMultipleProps, GroupModelStringified} from './types'

import {ref} from 'vue'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import WCheckbox from './WCheckbox.vue'

defineOptions({inheritAttrs: false})

const props = defineProps<CheckboxGroupMultipleProps<Model, Entity, ValueGetter>>()

const emit = defineEmits<{
  (e: 'select', value: Model): void
  (e: 'unselect', value: Model): void
}>()

const loadingItem = ref<Model | undefined>(undefined)

const getValue = (item: Model | Entity): Model => {
  if (props.valueGetter && typeof item === 'object') {
    return props.valueGetter(item as Entity)
  } else {
    return item as Model
  }
}

const emitUpdateModelValue = (value: Model): void => {
  loadingItem.value = value

  if (props.modelValue.includes(value)) emit('unselect', value)
  else emit('select', value)
}
</script>