<template>
  <div
    class="
      bg-default dark:bg-default-dark max-h-[calc(100%-var(--modal-wrapper-padding,2rem)*2)] w-[var(--modal-wrapper-width,35rem)] max-w-[calc(100%-var(--modal-wrapper-padding,2rem)*2)] overflow-y-auto
      overflow-x-hidden overscroll-contain rounded-3xl shadow-md
    "
    :class="{
      'sm-not:max-w-full sm-not:h-full sm-not:rounded-none sm-not:max-h-full': maximized,
    }"
  >
    <div class="bg-default dark:bg-default-dark sticky top-0 z-[1]">
      <div class="text-accent sm-not:text-xl flex items-center justify-center text-balance p-[var(--modal-wrapper-padding,2rem)] text-center text-2xl font-semibold">
        <slot name="title" />
      </div>

      <slot name="subtitle" />
    </div>

    <div class="sm:px-[var(--modal-wrapper-padding,2rem)]">
      <slot />
    </div>

    <div
      class="bg-default dark:bg-default-dark sticky bottom-0 z-[1] flex w-full justify-center gap-[var(--modal-wrapper-padding,2rem)] p-[var(--modal-wrapper-padding,2rem)]"
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
