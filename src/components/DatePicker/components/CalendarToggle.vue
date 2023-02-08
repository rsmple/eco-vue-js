<template>
  <div class="[--calendar-toggle-height:32px] flex items-center h-[var(--calendar-toggle-height)] w-full my-2">
    <div
      class="
        relative flex justify-center items-center h-[var(--calendar-toggle-height)] w-[var(--calendar-toggle-height)]
        rounded-xl cursor-pointer select-none w-ripple mr-auto
        hover:bg-primary-default hover:dark:bg-primary-dark hover:text-default text-description
      "
      @click="$emit('click:previous')"
    >
      <IconArrow class="rotate-90 -ml-1" />
    </div>

    <div class="text-base text-accent font-medium select-none text-center w-14">
      <slot />
    </div>

    <div
      class="
        relative flex justify-center items-center h-[var(--calendar-toggle-height)] w-[var(--calendar-toggle-height)]
        rounded-xl cursor-pointer select-none w-ripple ml-auto
        hover:bg-primary-default hover:dark:bg-primary-dark hover:text-default text-description
      "
      @click="$emit('click:next')"
    >
      <IconArrow class="-rotate-90 -mr-1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconArrow from '@/assets/icons/default/IconArrow.svg?component'

defineEmits<{
  (e: 'click:next'): void
  (e: 'click:previous'): void
}>()

</script>
