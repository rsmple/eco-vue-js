<template>
  <WInputSuggest
    ref="input"
    v-bind="props"
    :class="$attrs.class"
    @update:model-value="updateModelValue"

    @keypress:enter.stop.prevent="selectCursor"
    @keypress:up.prevent="cursorUp"
    @keypress:down.prevent="cursorDown"

    @open="isOpen = true"
    @close="close"
    @focus="focused = true"
    @blur="focused = false"
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
      v-if="$slots.right"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <div
        v-if="!options.length"
        class="px-[1.0625rem] py-2 first:pt-4 last:pb-4"
      >
        <div
          class="w-select-field sm-not:px-3 cursor-default select-none"
        >
          {{ emptyStub ?? 'No suggestion' }}
        </div>
      </div>

      <SelectOption
        v-for="(option, index) in options"
        :key="option.id"
        :is-selected="modelValue === valueGetter(option)"
        :is-cursor="index === cursor"
        :loading="loadingOptionIndex === index && loading"
        :scroll="isCursorLocked"
        class="first:pt-4 last:pb-4"
        @select="select(option); setLoadingOptionIndex(index)"
        @mouseenter="setCursor(index)"
      >
        <template #default="{selected}">
          <slot
            name="option"
            :option="option"
            :selected="selected"
            :model="false"
          >
            <component
              :is="optionComponent"
              :option="option"
              :selected="selected"
              :model="false"
            />
          </slot>
        </template>
      </SelectOption>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text', Option extends Record<string, any> & {id: number} = Record<string, any> & {id: number}">
import type {InputOptionsProps} from './types'

import {computed, nextTick, ref, toRef, useTemplateRef, watch} from 'vue'

import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import SelectOption from '@/components/Select/components/SelectOption.vue'
import {debounce} from '@/utils/utils'

type ModelValue = Required<InputOptionsProps<Type, Option>>['modelValue']

const props = defineProps<InputOptionsProps<Type, Option>>()

const emit = defineEmits<{
  (e: 'update:model-value', value: ModelValue): void
}>()

const isOpen = ref(false)
const inputRef = useTemplateRef('input')
const cursor = ref<number>(-1)
const isCursorLocked = ref(false)
const lastIndex = computed(() => props.options.length)
const focused = ref(false)
const loadingOptionIndex = ref<number | null>(null)

const isDisabled = computed(() => props.loading || props.readonly || props.disabled)

const close = () => {
  isOpen.value = false
  focused.value = false
}

const setLoadingOptionIndex = (value: number) => {
  if (isDisabled.value) return

  loadingOptionIndex.value = value
}

const unlockCursor = debounce(() => {
  isCursorLocked.value = false
}, 50)

const lockCursor = () => {
  isCursorLocked.value = true

  unlockCursor()
}

const setCursor = (value: number): void => {
  if (isCursorLocked.value) return

  cursor.value = value
}

const cursorUp = () => {
  if (isDisabled.value) return

  lockCursor()

  cursor.value = !props.options.length
    ? 0
    : cursor.value < 1
      ? lastIndex.value
      : cursor.value - 1
}

const cursorDown = () => {
  if (isDisabled.value) return

  lockCursor()

  cursor.value = !props.options.length
    ? 0
    : cursor.value >= lastIndex.value
      ? 0
      : cursor.value + 1
}

const selectCursor = () => {
  if (isDisabled.value) return

  const value = cursor.value !== -1 ? props.options[cursor.value] : undefined

  if (value) select(value)
}

const select = (option: Option): void => {
  updateModelValue(props.valueGetter(option))

  blur()
}

const updateModelValue = (value: ModelValue): void => {
  if (isDisabled.value || props.modelValue === value) return

  emit('update:model-value', value)
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

watch(toRef(props, 'modelValue'), async () => {
  await nextTick()

  inputRef.value?.updateDropdown()
})

defineExpose({
  focus,
  blur,
})
</script>
