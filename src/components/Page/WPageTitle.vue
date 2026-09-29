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
  /** Text of the heading, after its section number. */
  title: string
  /** A large heading, with the number in two digits, e.g. for a cover. */
  big?: boolean
}>()
</script>