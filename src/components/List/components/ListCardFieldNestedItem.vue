<template>
  <template
    v-for="(inner, index) in items"
    :key="(inner as Data).id"
  >
    <slot v-bind="{inner, index, last: index === items.length - 1, first: index === 0}" />
  </template>
</template>

<script setup lang="ts" generic="Data">
defineProps<{
  items: Data[]
}>()
</script>
