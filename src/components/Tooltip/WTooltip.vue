<template>
  <span
    v-if="!(noTouch && isTouchDevice)"
    ref="container"
    class="hidden"
  />
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, ref, useSlots, watch} from 'vue'
import {getIsTouchDevice} from '@/utils/mobile'
import {Tooltip} from '@/utils/Tooltip'
import {getIncrement} from './models/utils'

const props = defineProps<{
  text?: string
  noTouch?: boolean
  overflowOnly?: boolean
  light?: boolean
  trigger?: Element
}>()

const slots = useSlots()

const isTouchDevice = getIsTouchDevice()
const container = ref<HTMLDivElement>()

const parent = computed(() => container.value?.parentElement ?? null)
const triggerElement = computed(() => props.trigger ?? parent.value)

const open = () => {
  const slot = slots.default?.()?.[0]

  if (!parent.value) return
  if (!slot && !props.text) return

  if (props.overflowOnly) {
    const rect = parent.value.getBoundingClientRect()

    if (parent.value.scrollHeight === Math.round(rect.height) && parent.value.scrollWidth === Math.round(rect.width)) return
  }

  Tooltip.add({parent: parent.value, slot, text: props.text, light: props.light, key: getIncrement()})
}

const close = () => {
  Tooltip.close()
}

watch(triggerElement, (newValue, oldValue) => {
  oldValue?.removeEventListener('mouseenter', open)
  oldValue?.removeEventListener('mouseleave', close)
  newValue?.addEventListener('mouseenter', open)
  newValue?.addEventListener('mouseleave', close)
})

onBeforeUnmount(() => {
  triggerElement.value?.removeEventListener('mouseenter', open)
  triggerElement.value?.removeEventListener('mouseleave', close)

  close()
})

</script>
