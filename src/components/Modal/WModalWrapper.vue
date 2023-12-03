<template>
  <div
    class="
      bg-default dark:bg-default-dark overflow-y-auto overflow-x-hidden overscroll-contain w-[var(--modal-wrapper-width,35rem)]
      max-w-[calc(100%-var(--modal-wrapper-padding,2rem)*2)] max-h-[calc(100%-var(--modal-wrapper-padding,2rem)*2)] shadow-md rounded-3xl
    "
    :class="{
      'sm-not:max-w-full sm-not:h-full sm-not:rounded-none sm-not:max-h-full': maximized,
    }"
  >
    <div class="sticky top-0 z-[1] bg-default dark:bg-default-dark">
      <div class="text-accent font-semibold text-center p-[var(--modal-wrapper-padding,2rem)] flex justify-center items-center text-2xl sm-not:text-xl">
        <slot name="title" />
      </div>

      <slot name="subtitle" />
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
