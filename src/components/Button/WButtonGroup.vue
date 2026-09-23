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
      <WSkeleton
        v-if="skeleton"
        class="w-skeleton-h---w-input-height w-skeleton-rounded-[0.625rem]"
      />
      <div
        v-else
        role="group"
        class="flex max-w-full gap-0.5 rounded-[0.625rem] p-0.75 bg-gray-100 dark:bg-gray-800"
        :class="{
          'flex-wrap': wrap,
          'flex-col': col,
          'w-fit': !stretch,
        }"
      >
        <button
          v-for="(item, index) in list"
          :key="index"
          type="button"
          :aria-pressed="getValue(item as Model | Entity) === modelValue"
          class="
            relative isolate flex h-[calc(var(--w-input-height,2.75rem)-0.375rem)]
            bg-size-[200%] bg-position-[100%] items-center justify-center gap-2
            rounded-lg px-3 font-medium whitespace-nowrap outline-none select-none
          "
          :class="{
            [semanticTypeButtonBackgroundMap[semanticType] ?? semanticTypeBackgroundMap[semanticType]]: getValue(item as Model | Entity) === modelValue,
            'shadow-sm': getValue(item as Model | Entity) === modelValue,
            'text-black-default dark:text-gray-200 bg-transparent': getValue(item as Model | Entity) !== modelValue,
            'w-ripple cursor-pointer w-ripple-hover': !loading && !isItemDisabled(item),
            'cursor-progress': loading && getValue(item as Model | Entity) === loadingItem,
            'cursor-not-allowed opacity-70': isItemDisabled(item),
            'flex-1': stretch,
          }"
          :disabled="isItemDisabled(item)"
          @click="updateModelValue(getValue(item as Model | Entity))"
        >
          <div
            class="z-10 flex items-center justify-center gap-2"
            :class="{
              'opacity-0': loading && getValue(item as Model | Entity) === loadingItem,
            }"
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
          </div>

          <Transition
            enter-active-class="transition-opacity"
            leave-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <WSpinner
              v-if="loading && getValue(item as Model | Entity) === loadingItem"
              class="absolute z-10 w-spinner-size-(--w-button-spinner-size,1.25em)"
            />
          </Transition>
        </button>
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
import WSpinner from '@/components/Spinner/WSpinner.vue'

import {SemanticType, useSemanticTypeBackgroundMap, useSemanticTypeButtonBackgroundMap} from '@/utils/SemanticType'
import {useComponentStates} from '@/utils/useComponentStates'

import WSkeleton from '../Skeleton/WSkeleton.vue'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<ButtonGroupProps<Model, Entity, ValueGetter>>(),
  {
    semanticType: SemanticType.PRIMARY,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()
const semanticTypeButtonBackgroundMap = useSemanticTypeButtonBackgroundMap()

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

const isItemDisabled = (item: Model | Entity): boolean => {
  return !!(isDisabled.value || isReadonly.value || (props.loading && getValue(item) !== loadingItem.value))
}

const modelValueItem = computed(() => props.list.find(item => getValue(item) === props.modelValue))

const emitUpdateModelValue = (value: Model): void => {
  loadingItem.value = value

  emit('update:model-value', value)
}

const updateModelValue = (value: Model): void => {
  if (props.loading) return

  if (value !== props.modelValue) emitUpdateModelValue(value)
  else if (props.allowClear) emitUpdateModelValue(null as Model)
}
</script>