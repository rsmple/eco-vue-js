<template>
  <button
    class="square-[1.25em] relative flex items-center justify-center rounded-full outline-none"
    :class="{
      'cursor-not-allowed': disabled,
      'cursor-progress': loading,
      'w-ripple w-ripple-hover cursor-pointer ': !loading && !disabled,
    }"
    @click="!loading && !disabled && $emit('click', $event)"
    @mousedown="!loading && !disabled && $emit('mousedown', $event)"
  >
    <IconCancel class="square-[0.75em]" />
  </button>
</template>

<script setup lang="ts">
import IconCancel from '@/assets/icons/IconCancel.svg?component'

defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'mousedown', value: MouseEvent): void
}>()
</script>