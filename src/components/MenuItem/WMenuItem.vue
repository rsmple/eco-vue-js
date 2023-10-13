<template>
  <component
    :is="to ? RouterLink : 'button'"
    v-bind="to ? {to} : undefined"
    class="relative px-6 py-2 first:pt-4 last:pb-4 text-description select-none flex gap-4 w-full min-w-36 items-center text-start justify-start outline-none"
    :class="{
      'w-ripple w-ripple-hover hover:text-primary-default dark:hover:text-primary-dark cursor-pointer': !disabled,
      'opacity-50 cursor-not-allowed': disabled,
    }"
    :disabled="disabled"
  >
    <slot />
  </component>
</template>

<script lang="ts" setup>
import {type RouteLocationRaw, RouterLink} from 'vue-router'

defineProps<{
  to?: RouteLocationRaw
  disabled?: boolean
}>()

</script>