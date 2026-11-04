<template>
  <div
    v-if="!off"
    class="w-list-page-surface"
  />

  <div :class="off ? undefined : 'w-list-page-content'">
    <slot />

    <div
      v-if="!off"
      class="w-list-page-end"
    >
      <div class="w-list-page-end-band">
        <div class="w-list-page-end-fill" />
      </div>
    </div>
  </div>

  <div
    v-if="!off"
    class="w-list-page-frame"
  />
</template>

<script lang="ts" setup>
/**
 * The section a page list draws around its rows, in the page list's box (`w-list-page`): the surface behind them, the
 * box of the content with the bottom edge, and the frame that casts the shadow. See surfaces.css. `off` keeps only
 * the content's box, so the content stays mounted when the section comes and goes.
 */
defineProps<{
  off?: boolean
}>()

defineSlots<{
  default: () => void
}>()
</script>
