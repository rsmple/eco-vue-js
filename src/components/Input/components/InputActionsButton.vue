<template>
  <button
    :disabled="disabled"
    :class="{
      'w-ripple w-ripple-hover cursor-pointer': !disabled,
      'cursor-not-allowed': disabled,
      'items-center': !top,
      'items-start': top,
    }"
    class="text-description relative flex h-full w-11 select-none justify-center py-[0.6875rem]"
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