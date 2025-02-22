<template>
  <div class="sm-not:gap-1 grid grid-cols-[1fr,auto] gap-3">
    <div class="sm-not:text-xs text-description self-center truncate whitespace-nowrap text-base font-normal">
      <slot />
    </div>

    <button
      class="text-description w-ripple w-ripple-hover relative flex cursor-pointer select-none items-center justify-self-end"
      @click="$emit('click', $event)"
    >
      <IconCancel class="square-5 sm-not:-mx--inner-margin mx-[1.125rem]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>