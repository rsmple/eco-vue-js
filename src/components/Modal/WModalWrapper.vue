<template>
  <div
    class="bg-default dark:bg-default-dark overflow-y-auto overflow-x-hidden overscroll-contain w-[var(--modal-wrapper-width,35rem)]"
    :class="{
      'max-w-[calc(100%-var(--modal-wrapper-padding,2rem)*2)] max-h-[calc(100%-var(--modal-wrapper-padding,2rem)*2)] shadow-md rounded-3xl': !maximized,
      'max-w-full h-full': maximized,
    }"
  >
    <div
      class="sticky top-0 z-[1] text-accent font-semibold text-center p-[var(--modal-wrapper-padding,2rem)] bg-default dark:bg-default-dark flex justify-center items-center"
      :class="{
        'text-xl': maximized,
        'text-2xl': !maximized,
      }"
    >
      <slot name="title" />
    </div>

    <div class="sm:px-[var(--modal-wrapper-padding,2rem)]">
      <slot />
    </div>

    <div
      class="sticky bottom-0 flex justify-center p-[var(--modal-wrapper-padding,2rem)] gap-[var(--modal-wrapper-padding,2rem)] w-full bg-default dark:bg-default-dark"
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
