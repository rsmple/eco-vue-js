<template>
  <div
    ref="band"
    class="w-infinite-list-band pointer-events-none absolute inset-x-0 grid content-start grid-cols-[inherit] *:pointer-events-auto"
    :style="{top: `${ top }px`, height: `${ height }px`}"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, useTemplateRef} from 'vue'

/**
 * The box of a group in a recycled list, from its heading to its last item, over the rows: the heading, its first
 * child, sticks in it for as long as the group is in view. It lets the pointer through to the rows, and like a row it
 * is not a stacking context, so the heading's z-index counts among the rows' sticky cells.
 */
defineProps<{
  top: number
  height: number
}>()

const emit = defineEmits<{
  (e: 'mount', value: Element | null): void
}>()

const bandRef = useTemplateRef('band')

onMounted(() => emit('mount', bandRef.value?.firstElementChild ?? null))

onBeforeUnmount(() => emit('mount', null))

defineSlots<{
  default?: () => void
}>()
</script>
