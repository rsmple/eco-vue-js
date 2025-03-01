<template>
  <div class="sm-not:gap-1 grid grid-cols-[1fr,auto] gap-3">
    <div class="sm-not:text-xs text-description self-center truncate whitespace-nowrap font-normal">
      <slot />
    </div>

    <button
      class="text-description w-ripple w-ripple-hover relative flex cursor-pointer select-none items-center justify-self-end"
      @click="$emit('click', $event)"
    >
      <IconCancel class="square-[1.25em] mx-[--w-list-padding,1rem]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>