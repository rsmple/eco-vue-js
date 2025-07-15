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

import {useTooltipMeta} from './models/tooltipMeta'

const props = defineProps<{
  text?: string
  noTouch?: boolean
  overflowOnly?: boolean
  light?: boolean
  trigger?: Element
  noTrigger?: boolean
  maxHeight?: number
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}>()

const slots = useSlots()

const {tooltipMeta, setTooltipMeta} = useTooltipMeta()

const isTouchDevice = getIsTouchDevice()
const containerRef = useTemplateRef('container')
const id = useId()

const parent = computed(() => containerRef.value?.parentElement ?? null)
const triggerElement = computed(() => props.noTrigger ? null : (props.trigger ?? parent.value))
const isOpen = computed(() => tooltipMeta.value?.id === id)

const open = () => {
  const slot = slots.default?.()?.[0]

  if (!parent.value) return
  if (!slot && !props.text) return

  if (props.overflowOnly) {
    const rect = parent.value.getBoundingClientRect()

    if (parent.value.scrollHeight === Math.round(rect.height) && parent.value.scrollWidth === Math.round(rect.width)) return
  }

  setTooltipMeta({
    parent: parent.value,
    slot: slot ? markRaw(slot) : undefined,
    text: props.text,
    id,
    maxHeight: props.maxHeight,
    top: props.top,
    bottom: props.bottom,
    left: props.left,
    right: props.right,
  })
}

const close = () => {
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
  default?: () => VNode[]
}>()

defineExpose({
  isOpen,
  open,
  close,
})
</script>
