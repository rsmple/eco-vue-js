<template>
  <span
    v-if="!(noTouch && isTouchDevice)"
    ref="container"
    class="hidden"
  />
</template>

<script lang="ts" setup>
import {type VNode, computed, markRaw, onBeforeUnmount, toRef, useId, useSlots, useTemplateRef, watch} from 'vue'

import {getIsTouchDevice} from '@/utils/mobile'

import {type TooltipMeta, useTooltipMeta} from './models/tooltipMeta'

const props = defineProps<{
  /** Plain text content, shown on one line. The default slot takes precedence. Nothing opens when both are empty. */
  text?: string
  /** Skips the tooltip entirely on touch devices. */
  noTouch?: boolean
  /** Opens only when the trigger's content overflows it — for truncated text. */
  overflowOnly?: boolean
  /** Element that opens the tooltip on hover. Defaults to the tooltip's parent element. */
  trigger?: Element
  /** Attaches no hover listeners; open and close it through the exposed `open` and `close`. */
  noTrigger?: boolean
  /** Prefers placing the tooltip above the parent. */
  top?: boolean
  /** Prefers placing the tooltip below the parent. */
  bottom?: boolean
  /** Places the tooltip to the left of the parent. */
  left?: boolean
  /** Places the tooltip to the right of the parent. */
  right?: boolean
  /** Makes the tooltip ignore the cursor, so it closes when the pointer leaves the trigger and its content cannot be interacted with. For small hints that would otherwise block content underneath. */
  static?: boolean
  /** Milliseconds to wait on hover before opening. */
  delay?: number
}>()

const slots = useSlots()

const {tooltipMeta, setTooltipMeta} = useTooltipMeta()

const isTouchDevice = getIsTouchDevice()
const containerRef = useTemplateRef('container')
const id = useId()

const parent = computed(() => containerRef.value?.parentElement ?? null)
const triggerElement = computed(() => props.noTrigger ? null : (props.trigger ?? parent.value))
const isOpen = computed(() => tooltipMeta.value?.id === id)

let timeout: ReturnType<typeof setTimeout> | null = null

// Rendered by WTooltipContainer as a functional component, so the slot is re-evaluated reactively while open
const renderSlot = markRaw(() => slots.default?.())

const open = async () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }

  const hasSlot = !!slots.default?.()?.[0]

  if (!parent.value) return
  if (!hasSlot && !props.text) return

  if (props.overflowOnly) {
    const rect = parent.value.getBoundingClientRect()

    if (parent.value.scrollHeight === Math.round(rect.height) && parent.value.scrollWidth === Math.round(rect.width)) return
  }

  const payload: TooltipMeta = {
    parent: parent.value,
    slot: hasSlot ? renderSlot : undefined,
    text: props.text,
    id,
    top: props.top,
    bottom: props.bottom,
    left: props.left,
    right: props.right,
    static: props.static,
  }

  if (props.delay) {
    timeout = setTimeout(() => {
      setTooltipMeta(payload)
      timeout = null
    }, props.delay)
  } else setTooltipMeta(payload)
}

const close = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }

  setTooltipMeta(null)
}

watch(triggerElement, (newValue, oldValue) => {
  oldValue?.removeEventListener('mouseenter', open)
  oldValue?.removeEventListener('mouseleave', close)
  newValue?.addEventListener('mouseenter', open)
  newValue?.addEventListener('mouseleave', close)
})

watch(toRef(props, 'text'), () => {
  if (isOpen.value) open()
})

onBeforeUnmount(() => {
  triggerElement.value?.removeEventListener('mouseenter', open)
  triggerElement.value?.removeEventListener('mouseleave', close)

  close()
})

defineSlots<{
  /** Rich tooltip content, replacing `text`. It stays reactive while the tooltip is open. */
  default?: () => VNode[]
}>()

defineExpose({
  isOpen,
  open,
  close,
})
</script>
