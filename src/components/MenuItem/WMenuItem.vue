<template>
  <component
    :is="to && !disabled ? RouterLink : href ? 'a' : 'button'"
    v-bind="to && !disabled ? {to} : href ? {href, download} : undefined"
    class="text-description w-ripple-trigger block w-full min-w-36 select-none items-center justify-start px-2 text-start outline-none first:pt-2 last:pb-2"
    :class="{
      'hover:text-primary dark:hover:text-primary-dark cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
    :disabled="disabled"
    @click="!disabled && $emit('click', $event)"
  >
    <div
      :class="{
        'w-ripple w-ripple-hover relative flex w-full gap-4 rounded-lg px-2 py-1': !disabled,
      }"
    >
      <slot />
    </div>
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

interface Props extends Partial<LinkProps> {
  disabled?: boolean
  href?: string
  download?: string
}

defineProps<Props>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>