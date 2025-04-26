<template>
  <component
    :is="tag"
    v-bind="props"
    class="w-ripple w-ripple-hover w-ripple-has absolute inset-0 cursor-pointer select-none"
    :class="{
      'sm:w-ripple-rounded-[--w-list-rounded,unset] sm:rounded-[--w-list-rounded,unset]': card,
      [opacityClass ?? 'w-ripple-opacity-[0.05]']: true,
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
  opacityClass?: string
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>