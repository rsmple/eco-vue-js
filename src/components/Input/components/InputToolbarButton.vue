<template>
  <button
    class="text-accent group/toolbar first-not:-ml-px relative pb-1 pt-2"
    :class="{
      'cursor-not-allowed opacity-50': disabled,
      'w-ripple w-ripple-hover cursor-pointer': !disabled,
      'before:opacity-10': !disabled && active,
    }"
    @click.prevent="!disabled && $emit('click', $event)"
    @mouseenter="!disabled && $emit('mouseenter', $event)"
    @mouseleave="!disabled && $emit('mouseleave', $event)"
  >
    <div class="border-r border-solid border-gray-300 px-2 group-last/toolbar:border-r-0 dark:border-gray-600">
      <component
        :is="icon"
        class="square-[1.25em] -mt-[0.25em] inline"
      /> {{ title ?? '' }}
    </div>

    <WTooltip
      v-if="tooltip"
      :text="tooltip"
      top
    />
  </button>
</template>

<script setup lang="ts">
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  title: string | undefined
  icon: SVGComponent | undefined
  tooltip: string | undefined
  disabled: boolean | undefined
  active?: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'mouseenter', value: MouseEvent): void
  (e: 'mouseleave', value: MouseEvent): void
}>()
</script>