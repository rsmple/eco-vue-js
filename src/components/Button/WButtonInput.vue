<template>
  <WSkeleton
    v-if="skeleton"
    class="-square--w-input-height w-skeleton-rounded-[--w-input-rounded,0.75rem]"
  />

  <component
    :is="to ? RouterLink : 'button'"
    v-else
    v-bind="to ? {to} : undefined"
    class="
      -square--w-input-height bg-default dark:bg-default-dark relative flex select-none items-center
      justify-center rounded-[--w-input-rounded,0.75rem] border border-solid border-gray-200 dark:border-gray-800
    "
    :class="{
      'cursor-not-allowed opacity-50': disabled,
      'w-ripple w-ripple-hover cursor-pointer': !disabled,
      'cursor-progress': loading,
    }"
    :disabled="disabled"
    @click.stop.prevent="!disabled && !loading && $emit('click', $event)"
    @mousedown.stop.prevent
  >
    <WSpinner
      v-if="loading"
      class="w-spinner-size-[1.125em]"
    />

    <component
      :is="icon"
      v-else
      class="square-[1.125em]"
    />

    <WTooltip
      v-if="tooltipText"
      :text="tooltipText"
      no-touch
    />
  </component>
</template>

<script setup lang="ts">
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  icon: SVGComponent
  to?: LinkProps['to']
  tooltipText?: string
  loading?: boolean
  skeleton?: boolean
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>