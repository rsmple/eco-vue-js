<template>
  <div class="sm-not:gap-1 grid grid-cols-[1fr,auto] gap-3">
    <div class="sm-not:text-xs text-description self-center truncate whitespace-nowrap font-normal">
      <slot />
    </div>

    <button
      class="text-description w-ripple w-ripple-hover sm-not:-px--inner-margin relative flex cursor-pointer select-none items-center justify-self-end px-[--w-list-padding,1rem]"
      aria-label="Clear selection"
      @click="$emit('click', $event)"
    >
      <IconCancel class="square-[1.25em]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import IconCancel from '@/assets/icons/IconCancel.svg?component'

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>