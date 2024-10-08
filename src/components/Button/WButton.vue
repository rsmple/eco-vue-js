<template>
  <component
    v-bind="
      tag === 'a' ? {href, target} : to !== undefined ? {to, replace} : undefined
    "
    :is="to !== undefined ? RouterLink : tag"
    class="
      relative rounded-2xl outline-none isolate
      font-medium select-none whitespace-nowrap
      flex justify-center items-center
    "
    :class="{
      [semanticTypeButtonStylesMap[semanticType]]: true,
      [semanticTypeButtonBorderStylesMap[semanticType]]: true,
      'cursor-pointer w-ripple w-ripple-hover before:text-black-default w-ripple-opacity-20 dark:w-ripple-opacity-30': !loading && !disabled,
      'cursor-progress': loading,
      'cursor-not-allowed opacity-70': disabled,
      'px-4 h-11 min-h-[2.75rem]': !minimize,
      'px-1.5 h-7 min-h-[1.75rem]': minimize,
      '[&:not(:first-child)]:rounded-l-none [&:not(:first-child)]:border-l-0 [&:not(:last-child)]:rounded-r-none [&:not(:last-child)]:border-r-0': join
    }"
    :disabled="!loading && disabled"
    :type="type"
    @click="click"
    @keypress.enter.stop.prevent="click"
  >
    <div
      class="flex justify-center items-center gap-2 flex-1 z-10"
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
        class="absolute z-10 w-spinner-size-6"
      />
    </Transition>
  </component>
</template>

<script lang="ts" setup>
import WSpinner from '@/components/Spinner/WSpinner.vue'
import {SemanticType} from '@/utils/SemanticType'
import {RouterLink} from 'vue-router'
import {semanticTypeButtonStylesMap, semanticTypeButtonBorderStylesMap} from './models/semanticTypeStylesMap'
import type {LinkProps} from '@/types/types'

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
