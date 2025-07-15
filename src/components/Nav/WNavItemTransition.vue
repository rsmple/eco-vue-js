<template>
  <TransitionGroup
    enter-active-class="transition-[grid-template-rows] overflow-hidden grid"
    enter-from-class="grid-rows-[0fr]"
    enter-to-class="grid-rows-[1fr]"
    leave-active-class="transition-[grid-template-rows] overflow-hidden grid"
    leave-from-class="grid-rows-[1fr]"
    leave-to-class="grid-rows-[0fr]"
  >
    <slot />
  </TransitionGroup>
</template>

<script setup lang="ts">
</script>
