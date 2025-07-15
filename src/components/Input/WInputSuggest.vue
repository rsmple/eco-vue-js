<template>
  <component
    :is="isMobile ? WBottomSheet : WDropdownMenu"
    ref="dropdownMenu"
    v-bind="isMobile ? {
      isOpen,
      onClose: close
    } : {
      isOpen,
      maxHeight,
      maxWidth,
      horizontalAlign,
      updateAlign: true,
      parentElement: inputRef?.fieldRef,
    }"
  >
    <template #toggle="toggleScope: ({unclickable: boolean} | undefined)">
      <WInput
        ref="input"
        v-bind="{
          ...props,
          ...$attrs,
          title: toggleScope?.unclickable === false ? mobileTitle ?? title : title,
          unclickable: toggleScope?.unclickable,
          description: toggleScope?.unclickable === false ? undefined : description,
          seamless: toggleScope?.unclickable === false ? false : props.seamless,
        }"
        :class="{
          'cursor-pointer': !isDisabled && !isReadonly,
          'cursor-not-allowed': isDisabled && !isReadonly,
          'mb-3': isMobile && !toggleScope?.unclickable,
        }"
        @update:model-value="!loading && $emit('update:modelValue', $event as ModelValue)"

        @keypress:enter="$emit('keypress:enter', $event)"
        @keypress:up="$emit('keypress:up', $event)"
        @keypress:down="$emit('keypress:down', $event)"
        @keypress:delete="$emit('keypress:delete', $event)"

        @focus="open(); !toggleScope?.unclickable && $emit('focus', $event)"
        @blur="!isMobile && !persist && close(); !toggleScope?.unclickable && $emit('blur', $event)"

        @click="isMobile && toggleScope?.unclickable && open()"
        @click:suffix="isMobile && toggleScope?.unclickable && open()"
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

        <template #prefix>
          <slot
            name="prefix"
            :unclickable="toggleScope?.unclickable"
          />
        </template>

        <template #suffix>
          <IconArrow
            v-if="!isDisabled"
            class="square-3 text-description transition-transform"
            :class="{'rotate-180': isOpen}"
          />
        </template>

        <template
          v-if="$slots.right"
          #right
        >
          <slot name="right" />
        </template>
      </WInput>
    </template>

    <template #content="contentScope">
      <WInfiniteListScrollingElement
        :parent="isMobile"
        class="bg-default dark:bg-default-dark w-full"
        :class="{
          'pb-[50vh]': isMobile,
          'overflow-y-overlay max-h-[inherit] overflow-x-hidden overscroll-contain rounded-xl shadow-md dark:border dark:border-solid dark:border-gray-800': !isMobile,
          'mt-5': 'istop' in contentScope && contentScope.istop === false && (errorMessage || maxLength),
        }"
      >
        <template v-if="$slots.content">
          <template
            v-for="(slot, index) in $slots.content()"
            :key="index"
          >
            <component
              :is="slot"
              @close="close"
            />
          </template>
        </template>
      </WInfiniteListScrollingElement>
    </template>
  </component>
</template>

<script lang="ts" setup generic="Type extends InputType = 'text'">
import type {InputSuggestProps} from './types'

import {type VNode, computed, ref, useTemplateRef} from 'vue'

import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WInfiniteListScrollingElement from '@/components/InfiniteList/WInfiniteListScrollingElement.vue'
import WInput from '@/components/Input/WInput.vue'

import IconArrow from '@/assets/icons/default/IconArrow.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {useIsMobile} from '@/utils/mobile'
import {useComponentStates} from '@/utils/useComponentStates'

type ModelValue = Required<InputSuggestProps<Type>>['modelValue']

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<InputSuggestProps<Type>>(),
  {
    maxHeight: 320,
    maxWidth: 600,
    horizontalAlign: HorizontalAlign.FILL,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', event: ModelValue): void
  (e: 'keypress:enter', event: KeyboardEvent): void
  (e: 'keypress:up', event: KeyboardEvent): void
  (e: 'keypress:down', event: KeyboardEvent): void
  (e: 'keypress:delete', event: KeyboardEvent): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'click:clear'): void
  (e: 'focus', value: FocusEvent): void
  (e: 'blur', value: FocusEvent): void
}>()

const {isReadonly, isDisabled} = useComponentStates(props)

const isOpen = ref(false)
const dropdownMenuRef = useTemplateRef('dropdownMenu')
const inputRef = useTemplateRef('input')
const {isMobile} = useIsMobile()

const isDisabledComputed = computed(() => isReadonly.value || isDisabled.value)

const open = () => {
  if (isDisabledComputed.value) return

  isOpen.value = true

  emit('open')
}

const close = () => {
  isOpen.value = false

  emit('close')
}

const focus = () => {
  if (isMobile.value) open()

  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const scrollToInput = () => {
  inputRef.value?.scrollToInput()
}

const updateDropdown = () => {
  if (dropdownMenuRef.value && 'updateDropdown' in dropdownMenuRef.value) dropdownMenuRef.value.updateDropdown()
}

defineExpose({
  focus,
  blur,
  close,
  updateDropdown,
  scrollToInput,
})

defineSlots<{
  title?: () => void
  subtitle?: () => void
  prefix?: (props: {unclickable?: boolean | null}) => void
  right?: (props: Record<string, never>) => void
  content?: (props?: {scrollingElement?: Element}) => VNode[]
}>()
</script>
