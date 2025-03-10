<template>
  <component
    v-bind="{
      class: $attrs.class,
      style: $attrs.style as StyleValue,
      ...(disabled
        ? {}
        : tag === 'a'
          ? {href, target}
          : to !== undefined
            ? {to, replace}
            : {})
    }"
    :is="to !== undefined ? disabled ? 'a' : RouterLink : tag"
    class="
      w-ripple-rounded-[calc(var(--w-button-rounded,1rem)-0.0625rem)] relative isolate flex
      min-h-[--w-button-height,2.75rem] select-none
      items-center justify-center whitespace-nowrap
      rounded-[--w-button-rounded,1rem] px-[--w-button-rounded,1rem] font-medium outline-none
    "
    :class="{
      [semanticTypeMap?.[semanticType] ?? semanticTypeButtonStylesMap[semanticType]]: true,
      [semanticTypeMap?.[semanticType] ?? semanticTypeButtonBorderStylesMap[semanticType]]: true,
      'w-ripple w-ripple-hover before:text-black-default w-ripple-opacity-20 dark:w-ripple-opacity-30 cursor-pointer': !loading && !disabled,
      'cursor-progress': loading,
      'cursor-not-allowed opacity-70': disabled,
      'first-not:rounded-l-none first-not:border-l-0 first-not:before:rounded-l-none last-not:rounded-r-none last-not:border-r-0 last-not:before:rounded-r-none': join
    }"
    :disabled="!loading && disabled"
    :type="type"
    @click="click"
    @keypress.enter.stop.prevent="click"
  >
    <div
      class="z-10 flex flex-1 items-center justify-center gap-2"
      :class="{
        'opacity-0': loading,
      }"
    >
      <slot />
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <WSpinner
        v-if="loading"
        class="w-spinner-size-6 absolute z-10"
      />
    </Transition>
  </component>
</template>

<script lang="ts" setup>
import type {ButtonProps} from './types'

import {type StyleValue} from 'vue'
import {RouterLink} from 'vue-router'

import WSpinner from '@/components/Spinner/WSpinner.vue'

import {SemanticType} from '@/utils/SemanticType'

import {semanticTypeButtonBorderStylesMap, semanticTypeButtonStylesMap} from './models/semanticTypeStylesMap'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<ButtonProps>(),
  {
    semanticType: SemanticType.PRIMARY,
    tag: 'button',
    to: undefined,
    type: undefined,
    href: undefined,
    target: undefined,
    semanticTypeMap: undefined,
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent | KeyboardEvent): void
}>()

const click = (event: MouseEvent | KeyboardEvent): void => {
  if (props.disabled || props.loading) return

  emit('click', event)
}
</script>
