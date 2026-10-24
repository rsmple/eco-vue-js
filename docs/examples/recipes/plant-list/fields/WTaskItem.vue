<template>
  <!-- In the table, the list makes this a line of the table and each child spans it, so `<slot />` stays a direct child. -->
  <div>
    <div
      v-if="!first"
      class="my-1 border-t border-solid border-line-subtle"
    />

    <slot />
  </div>
</template>

<script setup lang="ts" generic="Item">
defineProps<{
  item: Item
  skeleton: boolean
  card: boolean
  index: number
  first: boolean
  last: boolean
}>()
</script>
