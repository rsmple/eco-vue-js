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

    <template #field>
      <div
        :class="{
          'flex flex-wrap items-center gap-x-4': wrap,
          'flex items-center gap-x-4 [&>*]:flex-1': stretch,
          'col-span-full grid grid-cols-subgrid': subgrid,
        }"
      >
        <WCheckbox
          v-for="(item, index) in list"
          :key="index"
          v-bind="{
            ...props,
            modelValue: getValue(item) === modelValue,
            title: titleMap?.[getValue(item)!.toString() as GroupModelStringified<Model>],
            tooltipText: tooltipTextMap?.[getValue(item)!.toString() as GroupModelStringified<Model>],
            icon: iconMap?.[getValue(item)!.toString() as GroupModelStringified<Model>],
            loading: loading && getValue(item as Model | Entity) === loadingItem,
            disabled: disabled || (loading && getValue(item as Model | Entity) !== loadingItem),
          }"
          :class="[classMap?.[getValue(item)!.toString() as GroupModelStringified<Model>], optionClass]"
          @update:model-value="updateModelValue(getValue(item as Model | Entity))"
        >
          <template
            v-if="$slots.option || optionComponent"
            #default
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
import type {CheckboxGroupProps, GroupModelStringified} from './types'

import {ref} from 'vue'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import WCheckbox from './WCheckbox.vue'

defineOptions({inheritAttrs: false})

const props = defineProps<CheckboxGroupProps<Model, Entity, ValueGetter>>()

const emit = defineEmits<{
  (e: 'update:model-value', value: Model): void
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

  emit('update:model-value', value)
}

const updateModelValue = (value: Model): void => {
  if (value !== props.modelValue) emitUpdateModelValue(value)
  else if (props.allowClear) emitUpdateModelValue(null as Model)
}
</script>