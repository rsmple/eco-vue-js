<template>
  <button
    class="square-5 relative flex items-center justify-center rounded-full outline-none"
    :class="{
      'cursor-not-allowed': disabled,
      'cursor-progress': loading,
      'w-ripple w-ripple-hover cursor-pointer ': !loading && !disabled,
    }"
    @click="!loading && !disabled && $emit('click', $event)"
  >
    <IconCancel class="square-3" />
  </button>
</template>

<script setup lang="ts">
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>