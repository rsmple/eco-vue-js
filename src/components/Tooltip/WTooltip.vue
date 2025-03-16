<template>
  <span
    v-if="!(noTouch && isTouchDevice)"
    ref="container"
    class="hidden"
  />
</template>

<script lang="ts" setup>
import {type VNode, computed, markRaw, onBeforeUnmount, ref, toRef, useSlots, useTemplateRef, watch} from 'vue'

import {Tooltip} from '@/utils/Tooltip'
import {getIsTouchDevice} from '@/utils/mobile'

import {getIncrement} from './models/utils'

const props = defineProps<{
  text?: string
  noTouch?: boolean
  overflowOnly?: boolean
  light?: boolean
  trigger?: Element
  maxHeight?: number
  left?: boolean
  right?: boolean
}>()

const slots = useSlots()

const isTouchDevice = getIsTouchDevice()
const containerRef = useTemplateRef('container')
const isOpen = ref(false)

const parent = computed(() => containerRef.value?.parentElement ?? null)
const triggerElement = computed(() => props.trigger ?? parent.value)

const open = () => {
  const slot = slots.default?.()?.[0]

  if (!parent.value) return
  if (!slot && !props.text) return

  isOpen.value = true

  if (props.overflowOnly) {
    const rect = parent.value.getBoundingClientRect()

    if (parent.value.scrollHeight === Math.round(rect.height) && parent.value.scrollWidth === Math.round(rect.width)) return
  }

  Tooltip.add({
    parent: parent.value,
    slot: slot ? markRaw(slot) : undefined,
    text: props.text,
    key: getIncrement(),
    maxHeight: props.maxHeight,
    left: props.left,
    right: props.right,
  })
}

const close = () => {
  isOpen.value = false

  Tooltip.close()
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
</script>
