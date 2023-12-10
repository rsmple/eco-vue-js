<template>
  <WInputSuggest
    ref="input"
    :title="title"
    :mobile-title="mobileTitle"
    :description="description"
    :model-value="(modelValue as ModelValue)"
    :max-length="maxSearchLength"
    :loading="loading"
    :readonly="readonly"
    :skeleton="skeleton"
    :size="searchSize"
    :error-message="errorMessage"
    :required="required"
    :disabled="disabled"
    :has-changes="hasChanges"
    :placeholder="placeholder"
    :no-margin="noMargin"
    :icon="icon"
    :mono="mono"
    :type="(type as Type)"
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
      v-if="$slots.right?.()?.length"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <div
        v-if="!options.length"
        class="py-2 px-[1.0625rem] first:pt-4 last:pb-4"
      >
        <div
          class="select-none cursor-default w-select-field sm-not:px-3"
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
import {ref, watch, toRef, nextTick, computed, type Component} from 'vue'
import SelectOption from '@/components/Select/components/SelectOption.vue'
import {debounce} from '@/utils/utils'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'

type ModelValue = Type extends 'number' ? number : string

const props = defineProps<{
  modelValue: ModelValue
  options: Option[]
  valueGetter: (option: Option) => ModelValue
  title?: string
  type?: Type | undefined
  mobileTitle?: string
  description?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: Component<{option: Option, selected?: boolean, model?: boolean}>
  disableClear?: boolean
  readonly?: boolean
  disabled?: boolean
  skeleton?: boolean
  searchSize?: number
  errorMessage?: string
  required?: boolean
  hasChanges?: boolean
  placeholder?: string
  noMargin?: boolean
  icon?: SVGComponent
  mono?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:model-value', value: ModelValue): void
}>()

const isOpen = ref(false)
const input = ref<ComponentInstance<typeof WInputSuggest> | undefined>()
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
  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
}

watch(toRef(props, 'modelValue'), async () => {
  await nextTick()

  input.value?.updateDropdown()
})

defineExpose({
  focus,
  blur,
})

</script>
