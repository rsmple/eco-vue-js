<template>
  <WSkeleton
    v-if="skeleton"
    class="square---w-input-height w-skeleton-rounded-(--w-input-rounded,0.75rem)"
  />

  <component
    :is="to ? WRouterLink : 'button'"
    v-else
    v-bind="to ? {to} : undefined"
    class="
      square---w-input-height bg-default dark:bg-default-dark relative flex select-none items-center
      justify-center rounded-(--w-input-rounded,0.75rem) border border-solid border-gray-200 dark:border-gray-800
    "
    :class="{
      'cursor-not-allowed opacity-50': disabled,
      'w-ripple w-ripple-hover cursor-pointer': !disabled,
      'cursor-progress': loading,
    }"
    :disabled="disabled"
    :aria-label="tooltipText"
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

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  /** Icon of the button. */
  icon: SVGComponent
  /** Router location — renders a router link. Needs vue-router installed in the app. */
  to?: LinkProps['to']
  /** Tooltip text, which also names the button. */
  tooltipText?: string
  /** Shows a spinner instead of the icon and ignores clicks. */
  loading?: boolean
  /** Shows a placeholder instead of the button. */
  skeleton?: boolean
  /** Grays the button out and ignores clicks. */
  disabled?: boolean
}>()

defineEmits<{
  /** The button was clicked, unless it is disabled or loading. */
  (e: 'click', value: MouseEvent): void
}>()
</script>