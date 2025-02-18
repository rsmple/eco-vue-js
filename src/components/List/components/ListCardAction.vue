<template>
  <component
    :is="tag"
    v-bind="props"
    class="w-ripple w-ripple-hover w-ripple-has w-ripple-opacity-[0.04] absolute inset-0 cursor-pointer"
    :class="{
      'w-ripple-rounded-[--w-list-rounded,unset] rounded-[--w-list-rounded,unset]': card,
    }"
    @click="$emit('click', $event)"
  />
</template>

<script setup lang="ts" generic="Props">
import type {Component} from 'vue'

defineProps<{
  tag: Component | keyof HTMLElementTagNameMap
  props?: Props
  card: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>