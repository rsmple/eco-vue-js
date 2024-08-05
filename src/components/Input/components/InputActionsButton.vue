<template>
  <button
    :disabled="disabled"
    :class="{
      'cursor-pointer w-ripple w-ripple-hover': !disabled,
      'cursor-not-allowed': disabled,
      'items-center': !top,
      'items-start': top,
    }"
    class="h-full w-11 py-[0.6875rem] flex justify-center relative text-description select-none"
    @mousedown.prevent.stop
    @click.stop="$emit('click', $event)"
  >
    <slot name="default">
      <component
        :is="icon"
        class="square-5"
      />

      <WTooltip
        v-if="tooltipText && !disabled"
        :text="tooltipText"
        no-touch
      />
    </slot>
  </button>
</template>

<script lang="ts" setup>
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  tooltipText?: string
  disabled?: boolean
  icon?: SVGComponent
  top?: boolean
}>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()

</script>