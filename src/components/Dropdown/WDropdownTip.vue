<template>
  <svg
    :viewBox="left || right ? '0 0 8 16' : '0 0 16 8'"
    class="pointer-events-auto z-10"
    :class="{
      'width-4 order-2 -mt-px mb-1': top,
      'width-2 order-2 -ml-px mr-1': left,
      'width-2 -mr-px ml-1': right,
      'width-4 -mb-px mt-1': !top && !left && !right,
    }"
    @mouseover="$emit('mouseover', $event)"
    @mouseleave="$emit('mouseleave', $event)"
  >
    <g
      :transform="top ? 'rotate(0 0 0)'
        : left ? 'rotate(-90 4 0)'
          : right ? 'rotate(90 0 -4)'
            : 'rotate(180 0 0)'"
      transform-origin="center center"
    >
      <rect
        width="16"
        height="8"
        fill="none"
      />
      <path
        d="M7.04 5.87C5.79 2.95 4.88.81 0 0h16c-4.88.81-5.8 2.95-7.04 5.87l-.13.31a.9.9 0 0 1-1.66 0z"
        fill="currentColor"
        class="text-tone-fill"
      />
      <path
        d="M0 .5c5.05.84 5.85 3.1 7.17 6.18a.9.9 0 0 0 1.66 0C10.15 3.6 10.95 1.34 16 .5"
        stroke="currentColor"
        stroke-width="1"
        fill="none"
        class="text-line-raised"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  top?: boolean
  left?: boolean
  right?: boolean
}>()

defineEmits<{
  (e: 'mouseover', value: MouseEvent): void
  (e: 'mouseleave', value: MouseEvent): void
}>()
</script>