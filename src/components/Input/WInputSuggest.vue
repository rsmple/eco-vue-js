<template>
  <component
    :is="isStatic ? InputSuggestStatic : WDropdownAdaptive"
    ref="dropdownMenu"
    v-bind="isStatic ? undefined : {
      isOpen,
      horizontalAlign,
      updateAlign: true,
      parentElement: parentEl,
      dropdownClass: `bg-surface rounded-xl ${dropdownClass ??''}`,
      onClose: close,
    }"
  >
    <template #toggle="toggleScope">
      <WInput
        ref="input"
        v-bind="{
          ...props,
          ...$attrs,
          title: toggleScope?.unclickable === false ? mobileTitle ?? title : title,
          unclickable: toggleScope?.unclickable,
          description: toggleScope?.unclickable === false ? undefined : description,
          seamless: toggleScope?.unclickable === false ? false : props.seamless,
          topText: topText || (isOpen && !toggleScope?.isTop),
          autofocus: autofocus ?? embedded,
        }"
        :class="{
          'cursor-pointer': !isDisabled && !isReadonly,
          'cursor-not-allowed': isDisabled && !isReadonly,
          'mb-3': isMobile && !toggleScope?.unclickable,
          'sm:pt-3': embedded,
        }"
        @update:model-value="!loading && $emit('update:model-value', $event as NonNullable<ModelValue>)"

        @keypress:enter="$emit('keypress:enter', $event)"
        @keypress:up="$emit('keypress:up', $event)"
        @keypress:down="$emit('keypress:down', $event)"
        @keypress:delete="$emit('keypress:delete', $event)"

        @focus="open(); !toggleScope?.unclickable && $emit('focus', $event); focused = true"
        @blur="!isMobile && !persist && close(); !toggleScope?.unclickable && $emit('blur', $event); focused = false"

        @click="isMobile && toggleScope?.unclickable && open()"
        @click:clear="$emit('click:clear'); closeOnClear && close()"
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
          v-if="$slots.toolbar"
          #toolbar="scope"
        >
          <slot
            name="toolbar"
            v-bind="scope"
          />
        </template>

        <template #prefix>
          <slot
            name="prefix"
            :unclickable="toggleScope?.unclickable"
          />
        </template>

        <template
          v-if="$slots.before"
          #before="scope"
        >
          <slot
            name="before"
            v-bind="scope"
          />
        </template>

        <template
          v-if="$slots.bottom || (isStatic && $slots.content)"
          #bottom
        >
          <template v-if="embedded">
            <div class="pb-4" />
            <WInfiniteListScrollingElement class="overflow-y-auto overscroll-y-contain">
              <slot
                name="content"
                v-bind="{focused, focus, blur}"
              />
            </WInfiniteListScrollingElement>
          </template>

          <template v-else-if="static">
            <div class="pb-4" />
            <slot
              name="content"
              v-bind="{focused, focus, blur}"
            />
          </template>
          <slot name="bottom" />
        </template>

        <template
          v-if="!isReadonly && !hideToggle && !isStatic"
          #suffix
        >
          <InputActionsButton
            label="Show suggest"
            :expanded="isOpen"
            :disabled="isDisabled"
            @click="isOpen ? toggleScope.unclickable === false ? close() : blur() : focus()"
          >
            <IconArrow
              class="square-3 text-description transition-transform"
              :class="{'rotate-180': isOpen}"
            />
          </InputActionsButton>
        </template>

        <template
          v-if="$slots.right"
          #right
        >
          <slot
            name="right"
            :unclickable="toggleScope?.unclickable"
          />
        </template>
      </WInput>
    </template>

    <template
      v-if="!isStatic"
      #content
    >
      <WInfiniteListScrollingElement
        :parent="isMobile"
        class="bg-surface w-full"
        :class="{
          'pb-[50vh]': isMobile,
          'max-h-[inherit] overflow-auto overscroll-contain rounded-xl shadow-md border border-solid border-line-raised': !isMobile,
        }"
      >
        <template v-if="$slots.content">
          <slot
            name="content"
            v-bind="{focused, focus, blur}"
          />
        </template>
      </WInfiniteListScrollingElement>
    </template>
  </component>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import type {InputSuggestProps, WrapSelection} from './types'

import {type VNode, computed, ref, shallowRef, useTemplateRef} from 'vue'

import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'
import WInfiniteListScrollingElement from '@/components/InfiniteList/WInfiniteListScrollingElement.vue'
import WInput from '@/components/Input/WInput.vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {useIsMobile} from '@/utils/mobile'
import {useComponentStates} from '@/utils/useComponentStates'

import InputActionsButton from './components/InputActionsButton.vue'
import InputSuggestStatic from './components/InputSuggestStatic.vue'

type ModelValue = Required<InputSuggestProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputSuggestProps<Type>>(),
  {
    horizontalAlign: HorizontalAlign.FILL,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  /** The typed value. Not emitted while `loading`. */
  (e: 'update:model-value', event: NonNullable<ModelValue>): void
  /** Enter without modifiers. */
  (e: 'keypress:enter', event: KeyboardEvent): void
  /** Arrow Up without modifiers. */
  (e: 'keypress:up', event: KeyboardEvent): void
  /** Arrow Down without modifiers. */
  (e: 'keypress:down', event: KeyboardEvent): void
  /** Backspace or Delete without modifiers. */
  (e: 'keypress:delete', event: KeyboardEvent): void
  /** The menu opened, on focus. */
  (e: 'open'): void
  /** The menu closed. */
  (e: 'close'): void
  /** The clear button was clicked. */
  (e: 'click:clear'): void
  /** The input got focus. On mobile, not emitted by the field that opens the bottom sheet. */
  (e: 'focus', value: FocusEvent | undefined): void
  /** The input lost focus. On mobile, not emitted by the field that opens the bottom sheet. */
  (e: 'blur', value: FocusEvent): void
}>()

const {isReadonly, isDisabled} = useComponentStates(props)

const isOpen = ref(false)
const focused = ref(false)
const dropdownMenuRef = useTemplateRef('dropdownMenu')
const inputRef = useTemplateRef('input')
const parentEl = shallowRef<Element | null>(null)
const {isMobile} = useIsMobile()

const isDisabledComputed = computed(() => isReadonly.value || isDisabled.value)

const isStatic = computed(() => props.static || props.embedded)

const open = () => {
  if (isDisabledComputed.value) return

  parentEl.value = inputRef.value?.getFieldEl() ?? null
  isOpen.value = true

  emit('open')
}

const close = () => {
  isOpen.value = false
  parentEl.value = null

  emit('close')
}

const focus = () => {
  if (isMobile.value) open()

  inputRef.value?.focus()
}

const blur = () => inputRef.value?.blur()
const scrollToInput = () => inputRef.value?.scrollToInput()
const wrapSelection = (value: WrapSelection) => inputRef.value?.wrapSelection(value)
const setCaret = (indexStart: number, indexEnd?: number) => inputRef.value?.setCaret(indexStart, indexEnd)
const getCaret = () => inputRef.value?.getCaret()

const updateDropdown = () => dropdownMenuRef.value && 'updateDropdown' in dropdownMenuRef.value ? dropdownMenuRef.value.updateDropdown() : void 0

defineExpose({
  focus,
  blur,
  close,
  updateDropdown,
  scrollToInput,
  wrapSelection,
  setCaret,
  getCaret,
})

defineSlots<{
  /** Replaces the `title` text. */
  title?: () => void
  /** Content between the title and the field. */
  subtitle?: () => void
  /** Extra buttons in the textarea toolbar — `wrapSelection` applies a formatting to the selected text. Shows the toolbar on its own. */
  toolbar?: (props: {wrapSelection: (value: WrapSelection) => void}) => void
  /** Content before the text inside the field, such as chips. `unclickable` is `true` for the field that opens the mobile bottom sheet. */
  prefix?: (props: {unclickable?: boolean | null}) => void
  /** Content right before the text, in the same box as the input. */
  before?: (props: {modelValue: ModelValue | undefined, focused: boolean}) => void
  /** Content to the right of the field. `unclickable` is `true` for the field that opens the mobile bottom sheet. */
  right?: (props: {unclickable?: boolean | null}) => void
  /** Content under the field, after a `static` or `embedded` menu. */
  bottom?: () => void
  /** Menu content. `focus` and `blur` move focus to and from the input, which opens and closes the menu. */
  content?: (props: {focused: boolean, blur: () => void, focus: () => void}) => VNode[]
}>()
</script>
