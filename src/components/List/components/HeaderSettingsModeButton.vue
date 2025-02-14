<template>
  <button
    class="w-ripple w-ripple-hover relative flex justify-center rounded-2xl p-4"
    :class="{
      'text-primary-default dark:text-primary-dark bg-primary-default/10 dark:bg-primary-dark/10': active,
      'text-description': !active,
    }"
  >
    <component
      :is="icon"
      class="square-6"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: SVGComponent
  active: boolean
}>()
</script>