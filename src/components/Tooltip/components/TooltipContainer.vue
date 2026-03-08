<template>
  <div
    class="pointer-events-none flex items-center"
    :class="{
      'flex-col': !isLeft && !isRight,
      'justify-end': isLeft,
    }"
  >
    <svg
      :viewBox="isLeft || isRight ? '0 0 8 16' : '0 0 16 8'"
      class="pointer-events-auto z-10"
      :class="{
        'width-4 order-2 -mt-px mb-1': isTop,
        'width-2 order-2 -ml-px mr-1': isLeft,
        'width-2 -mr-px ml-1': isRight,
        'width-4 -mb-px mt-1': !isTop && !isLeft && !isRight,
      }"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    >
      <g
        :transform="isTop ? 'rotate(0 0 0)'
          : isLeft ? 'rotate(-90 4 0)'
            : isRight ? 'rotate(90 0 -4)'
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
          class="text-black-default dark:text-gray-800"
        />
        <path
          d="M0 .5c5.05.84 5.85 3.1 7.17 6.18a.9.9 0 0 0 1.66 0C10.15 3.6 10.95 1.34 16 .5"
          stroke="currentColor"
          stroke-width="1"
          fill="none"
          class="text-gray-400 dark:text-gray-600"
        />
      </g>
    </svg>

    <div
      ref="container"
      class="
        bg-black-default text-default pointer-events-auto max-w-[calc(100vw-1.5rem)]
        rounded-lg border border-solid
        border-gray-400 px-3 py-2 text-center text-xs
        font-medium shadow-md will-change-transform dark:border-gray-600 dark:bg-gray-800
      "
      :class="isLeft || isRight ? undefined : 'w-tooltip-center-x'"
      @mouseover="$emit('over')"
      @mouseleave="$emit('leave')"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  isTop?: boolean
  isLeft?: boolean
  isRight?: boolean
}>()

defineEmits<{
  (e: 'over'): void
  (e: 'leave'): void
}>()
</script>