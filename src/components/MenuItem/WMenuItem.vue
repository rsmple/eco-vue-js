<template>
  <component
    :is="disabled ? 'div' : to ? RouterLink : href ? 'a' : 'button'"
    v-bind="disabled ? undefined : to ? {to} : href ? {href, download} : undefined"
    class="w-ripple-trigger block w-full select-none items-center justify-start px-2 text-start outline-none first:pt-2 last:pb-2"
    :class="{
      'hover:text-primary dark:hover:text-primary-dark cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
      'text-primary dark:text-primary-dark': active && !disabled,
      'text-description': !active || disabled,
    }"
    :disabled="disabled"
    @click="!disabled && $emit('click', $event)"
  >
    <div
      class="relative flex w-full gap-4 rounded-lg px-2 py-1"
      :class="{
        'w-ripple w-ripple-hover': !disabled,
        'before:opacity-10': active && !disabled
      }"
    >
      <slot />

      <div
        v-if="active"
        class="ml-auto flex h-full items-center pl-1"
      >
        <IconCheck class="square-[1.25em]" />
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import IconCheck from '@/assets/icons/IconCheck.svg?component'

interface Props extends Partial<LinkProps> {
  disabled?: boolean
  href?: string
  download?: string
  active?: boolean
}

defineProps<Props>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>