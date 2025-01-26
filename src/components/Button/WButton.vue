<template>
  <component
    v-bind="
      disabled ? undefined : tag === 'a' ? {href, target} : to !== undefined ? {to, replace} : undefined
    "
    :is="to !== undefined ? disabled ? 'a' : RouterLink : tag"
    class="
      w-ripple-rounded-[calc(var(--w-button-rounded,1rem)-0.0625rem)] relative isolate flex
      h-[--w-button-height,2.75rem] min-h-[--w-button-height,2.75rem] select-none
      items-center justify-center whitespace-nowrap
      rounded-[--w-button-rounded,1rem] px-[--w-button-rounded,1rem] font-medium outline-none
    "
    :class="{
      [semanticTypeMap?.[semanticType] ?? semanticTypeButtonStylesMap[semanticType]]: true,
      [semanticTypeMap?.[semanticType] ?? semanticTypeButtonBorderStylesMap[semanticType]]: true,
      'w-ripple w-ripple-hover before:text-black-default w-ripple-opacity-20 dark:w-ripple-opacity-30 cursor-pointer': !loading && !disabled,
      'cursor-progress': loading,
      'cursor-not-allowed opacity-70': disabled,
      '[&:not(:first-child)]:rounded-l-none [&:not(:first-child)]:border-l-0 [&:not(:last-child)]:rounded-r-none [&:not(:last-child)]:border-r-0': join
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
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import WSpinner from '@/components/Spinner/WSpinner.vue'

import {SemanticType} from '@/utils/SemanticType'

import {semanticTypeButtonBorderStylesMap, semanticTypeButtonStylesMap} from './models/semanticTypeStylesMap'

interface Props extends Partial<LinkProps> {
  semanticType?: SemanticType
  disabled?: boolean
  loading?: boolean
  tag?: 'a' | 'button'
  type?: string
  replace?: boolean
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  minimize?: boolean
  join?: boolean
  semanticTypeMap?: Partial<Record<SemanticType, string>>
}

const props = withDefaults(
  defineProps<Props>(),
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
