<template>
  <button
    :disabled="disabled"
    :class="{
      'w-ripple w-ripple-hover cursor-pointer': !disabled,
      'cursor-not-allowed': disabled,
      'h-[calc(var(--w-input-height,2.75rem)-2px)]': top,
      'h-full': !top,
    }"
    class="text-description relative flex w-[calc(var(--w-input-height,2.75rem)-2px)] select-none items-center justify-center"
    :aria-label="label ?? tooltipText"
    :aria-disabled="disabled"
    :aria-pressed="pressed"
    :aria-expanded="expanded"
    @mousedown.prevent.stop
    @click.stop="$emit('click', $event)"
  >
    <slot name="default">
      <component
        :is="icon"
        class="square-[1.125em]"
      />
    </slot>

    <WTooltip
      v-if="tooltipText && !disabled"
      :text="tooltipText"
      no-touch
    />
  </button>
</template>

<script lang="ts" setup>
import WTooltip from '@/components/Tooltip/WTooltip.vue'

withDefaults(
  defineProps<{
    tooltipText?: string
    disabled?: boolean
    icon?: SVGComponent
    top?: boolean
    label?: string
    pressed?: boolean
    expanded?: boolean
  }>(),
  {
    tooltipText: undefined,
    icon: undefined,
    label: undefined,
    pressed: undefined,
    expanded: undefined,
  },
)

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>