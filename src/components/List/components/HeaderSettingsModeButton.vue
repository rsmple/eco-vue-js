<template>
  <button
    class="w-ripple w-ripple-hover relative flex justify-center rounded-2xl p-4"
    :class="{
      'text-primary dark:text-primary-dark bg-primary/10 dark:bg-primary-dark/10': active,
      'text-description': !active,
    }"
    :aria-pressed="active"
    :aria-label="label"
    @click="$emit('click', $event)"
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
  label: string
  active: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>