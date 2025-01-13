<template>
  <span
    class="
      text-black-default tracking-tight
      [counter-increment:section] before:[--tw-content:counters(section,'.',var(--w-report-counter-style,null))]
    "
    :class="{
      'font-semibold before:text-gray-400': !big,
      'text-6xl font-bold before:text-gray-300 before:[--w-report-counter-style:decimal-leading-zero]': big,
    }"
  >&nbsp;{{ title }}</span>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  big?: boolean
}>()
</script>