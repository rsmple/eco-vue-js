<template>
  <div
    class="pointer-events-none flex items-center tone-surface-muted"
    :class="{
      'flex-col': !isLeft && !isRight,
      'justify-end': isLeft,
    }"
  >
    <WDropdownTip
      :top="isTop"
      :left="isLeft"
      :right="isRight"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    />

    <div
      ref="container"
      class="
        bg-tone-fill text-tone-on pointer-events-auto max-w-[calc(100vw-1.5rem)]
        rounded-lg border border-solid
        border-line-raised px-3 py-2 text-center text-xs
        font-medium shadow-md will-change-transform
      "
      :class="isLeft || isRight ? undefined : 'w-tooltip-center-x'"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import WDropdownTip from '@/components/Dropdown/WDropdownTip.vue'

defineProps<{
  isTop?: boolean
  isLeft?: boolean
  isRight?: boolean
}>()

defineEmits<{
  (e: 'over'): void
  (e: 'leave'): void
}>()
</script>