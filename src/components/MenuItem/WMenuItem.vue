<template>
  <component
    :is="to ? RouterLink : href ? 'a' : 'button'"
    v-bind="to ? {to} : href ? {href, download} : undefined"
    class="text-description relative flex w-full min-w-36 select-none items-center justify-start gap-4 px-6 py-2 text-start outline-none first:pt-4 last:pb-4"
    :class="{
      'w-ripple w-ripple-hover hover:text-primary-default dark:hover:text-primary-dark cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
    :disabled="disabled"
  >
    <slot />
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

withDefaults(
  defineProps<Props>(),
  {
    href: undefined,
    download: undefined,
    to: undefined,
  },
)
</script>