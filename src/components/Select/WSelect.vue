<template>
  <WInputSuggest
    ref="input"
    v-bind="{
      ...props,
      modelValue: search,
      hideInput: modelValue.length === 0 ? false : isMobile ? !focused : !isOpen,
    }"
    :class="$attrs.class"
    @update:model-value="!loading && $emit('update:search', $event as string ?? '')"

    @keypress:enter.stop.prevent="selectCursor"
    @keypress:up.prevent="cursorUp"
    @keypress:down.prevent="cursorDown"
    @keypress:delete="captureDoubleDelete"

    @open="isOpen = true"
    @close="close(); $emit('update:search', '')"
    @focus="focused = true; $emit('focus', $event)"
    @blur="focused = false; $emit('blur', $event)"
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

    <template #prefix="{unclickable}">
      <template v-if="hidePrefix ? isMobile ? (unclickable || !focused) : !isOpen : true">
        <SelectOptionPrefix
          v-for="option in modelValue"
          :key="option"
          :option="option"
          :option-component="(optionComponent as SelectOptionComponent<Option>)"
          :option-component-props="(optionComponentProps as SelectProps<Option, OptionComponent>['optionComponentProps'])"
          :loading="loading"
          :disabled="disabled"
          :disable-clear="disableClear"
          @unselect="unselect(option)"
        >
          <template #option>
            <slot
              name="option"
              :option="option"
              :selected="true"
              :model="true"
            />
          </template>
        </SelectOptionPrefix>
      </template>
    </template>

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
        <div class="select-none cursor-default w-select-field sm-not:px-3">
          {{ emptyStub ?? 'No match' }}
        </div>
      </div>

      <SelectOption
        v-for="(option, index) in options"
        :key="option"
        :is-selected="modelValue.includes(option)"
        :is-cursor="index === cursor"
        :loading="loadingOptionIndex === index && loading"
        :scroll="isCursorLocked"
        :hide-option-icon="hideOptionIcon"
        class="first:pt-4 last:pb-4"
        @select="select(option); setLoadingOptionIndex(index)"
        @unselect="unselect(option); setLoadingOptionIndex(index)"
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
              v-bind="(optionComponentProps as SelectOptionComponentProps<Option, OptionComponent>)"
              :is="optionComponent"
              :option="option"
              :selected="selected"
              :model="false"
            />
          </slot>
        </template>
      </SelectOption>

      <SelectOption
        v-if="allowCreate && search !== ''"
        :is-selected="false"
        :is-cursor="cursor === options.length"
        :loading="loadingOptionIndex === options.length && loading"
        :scroll="isCursorLocked"
        :hide-option-icon="hideOptionIcon"
        class="first:pt-4 last:pb-4"
        @select="createOption(search)"
        @mouseenter="setCursor(options.length)"
      >
        <template #prefix>
          <span class="w-select-field pr-2 sm-not:px-3">
            Create:
          </span>
        </template>

        <slot
          name="option"
          :option="search"
          :selected="false"
          :model="false"
        >
          <component
            v-bind="(optionComponentProps as SelectOptionComponentProps<Option, OptionComponent>)"
            :is="optionComponent"
            :option="search"
            :selected="false"
            :model="false"
          />
        </slot>
      </SelectOption>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Option extends string | number, OptionComponent extends SelectOptionComponent<Option>">
import {ref, watch, toRef, nextTick, computed} from 'vue'
import SelectOption from './components/SelectOption.vue'
import SelectOptionPrefix from './components/SelectOptionPrefix.vue'
import {getIsMobile} from '@/utils/mobile'
import {debounce} from '@/utils/utils'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import type {SelectProps, SelectOptionComponent, SelectOptionComponentProps} from './types'

defineOptions({inheritAttrs: false})

const props = defineProps<SelectProps<Option, OptionComponent>>()

const emit = defineEmits<{
  (e: 'select', item: Option): void
  (e: 'unselect', item: Option): void
  (e: 'update:search', value: string): void
  (e: 'create:option', value: string): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}>()

const isOpen = ref(false)
const input = ref<ComponentInstance<typeof WInputSuggest<'text'>> | undefined>()
const cursor = ref<number>(-1)
const isCursorLocked = ref(false)
const lastIndex = computed(() => props.allowCreate ? props.options.length : props.options.length - 1)
const isMobile = getIsMobile()
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

  if (value) {
    setLoadingOptionIndex(cursor.value)

    if (props.modelValue.includes(value)) unselect(value)
    else select(value)
  } else {
    if (props.search) createOption(props.search)
  }
}

let deletePressTimeout: NodeJS.Timeout | null = null

const captureDoubleDelete = () => {
  if (!props.modelValue.length || props.search.length) return

  if (deletePressTimeout) {
    unselect(props.modelValue[props.modelValue.length - 1])

    clearTimeout(deletePressTimeout)
    deletePressTimeout = null
  } else {
    deletePressTimeout = setTimeout(() => {
      deletePressTimeout = null
    }, 500)
  }
}

const select = (item: Option): void => {
  if (isDisabled.value) return

  emit('select', item)
}

const unselect = (item: Option): void => {
  if (isDisabled.value) return

  emit('unselect', item)
}

const createOption = (item: string): void => {
  if (isDisabled.value) return
  if (!props.allowCreate) return

  setLoadingOptionIndex(props.options.length)

  emit('create:option', item)
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

defineSlots<{
  title?: () => void
  subtitle?: () => void
  option?: (props: {
    option: Option | string
    selected: boolean
    model: boolean
  }) => void,
  right?: () => void
}>()

</script>
