<template>
  <div
    class="
      bg-default dark:bg-default-dark max-h-[calc(100%-var(--inner-margin,2rem)*2)] w-[var(--w-modal-wrapper-width,35rem)] max-w-[calc(100%-var(--inner-margin,2rem)*2)] overflow-y-auto
      overflow-x-hidden overscroll-contain rounded-[--w-modal-wrapper-rounded,1.5rem] shadow-md
    "
    :class="{
      'sm-not:max-w-full sm-not:h-full sm-not:rounded-none sm-not:max-h-full': maximized,
    }"
  >
    <div class="bg-default dark:bg-default-dark sticky top-0 z-[1]">
      <div class="text-accent sm-not:text-xl -p--w-modal-wrapper-padding flex items-center justify-center text-balance text-center text-2xl font-semibold">
        <slot name="title" />
      </div>

      <slot name="subtitle" />
    </div>

    <div class="sm:-px--w-modal-wrapper-padding">
      <slot />
    </div>

    <div
      class="bg-default dark:bg-default-dark -gap--inner-margin -p--w-modal-wrapper-padding sticky bottom-0 z-[1] flex w-full justify-center"
      :class="{
        'sm-not:flex-col': !maximized,
      }"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  maximized?: boolean
}>()
</script>
