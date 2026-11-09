<template>
  <pre
    :id="`probe-${ name }`"
    class="hidden"
  >{{ JSON.stringify(value ?? null) }}</pre>
</template>

<script lang="ts" setup>
/** Renders a value as JSON for the tests to read, such as the scope a slot got. */
defineProps<{
  name: string
  value: unknown
}>()
</script>
