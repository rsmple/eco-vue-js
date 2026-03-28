<template>
  <component
    :is="disabled || loading ? 'div' : to ? WRouterLink : href ? 'a' : 'button'"
    v-bind="disabled || loading ? undefined : to ? {to} : href ? {href, download} : undefined"
    class="w-ripple-trigger relative block w-full select-none items-center justify-start px-2 text-start outline-none first:pt-2 last:pb-2"
    :class="{
      'hover:text-primary dark:hover:text-primary-dark cursor-pointer': !disabled && !loading,
      'cursor-not-allowed opacity-50': disabled,
      'text-primary dark:text-primary-dark': active && !disabled,
      'text-description': !active || disabled,
      'cursor-progress': loading,
    }"
    :disabled="disabled"
    @click="!disabled && !loading && $emit('click', $event)"
  >
    <div
      class="relative grid w-full rounded-lg px-2 py-1 transition-opacity"
      :class="{
        'w-ripple w-ripple-hover': !disabled,
        'before:opacity-10': active && !disabled,
        'grid-cols-[1fr,1.25rem] gap-4': active !== undefined,
        'grid-cols-[1fr]': active === undefined,
        'opacity-0': loading,
      }"
    >
      <div class="flex items-center gap-4">
        <slot />
      </div>

      <div
        v-if="active"
        class="flex h-full items-center"
      >
        <IconCheck class="square-[1.25em]" />
      </div>
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center"
      >
        <WSpinner class="w-spinner-size-[1.25em]" />
      </div>
    </Transition>

    <WTooltip
      v-if="tooltipText"
      :text="tooltipText"
      left
    />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import IconCheck from '@/assets/icons/IconCheck.svg?component'

import WSpinner from '../Spinner/WSpinner.vue'

interface Props extends Partial<LinkProps> {
  disabled?: boolean
  href?: string
  download?: string
  active?: boolean
  tooltipText?: string
  loading?: boolean
}

withDefaults(
  defineProps<Props>(),
  {
    active: undefined,
    download: undefined,
    href: undefined,
    tooltipText: undefined,
  },
)

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>