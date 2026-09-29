<template>
  <button
    class="square-[1.25em] relative flex items-center justify-center rounded-full outline-none"
    :class="{
      'cursor-not-allowed': disabled,
      'cursor-progress': loading,
      'w-ripple w-ripple-hover cursor-pointer ': !loading && !disabled,
    }"
    :disabled="disabled"
    :aria-disabled="disabled || loading"
    aria-label="Clear selection"
    @click="!loading && !disabled && $emit('click', $event)"
    @mousedown="!loading && !disabled && $emit('mousedown', $event)"
  >
    <IconCancel class="square-[0.75em]" />
  </button>
</template>

<script setup lang="ts">
import IconCancel from '@/assets/icons/IconCancel.svg?component'

defineProps<{
  /** Disables the button. */
  disabled?: boolean
  /** Ignores clicks, e.g. while the value is saving. */
  loading?: boolean
}>()

defineEmits<{
  /** The button was clicked, unless it is disabled or loading. */
  (e: 'click', value: MouseEvent): void
  /** A mouse button was pressed on it, unless it is disabled or loading. */
  (e: 'mousedown', value: MouseEvent): void
}>()
</script>