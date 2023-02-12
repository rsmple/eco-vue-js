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

const props = defineProps<{
  text?: string
  noTouch?: boolean
  overflowOnly?: boolean
  light?: boolean
}>()

const slots = useSlots()

const isTouchDevice = getIsTouchDevice()
const container = ref<HTMLDivElement>()

const parent = computed(() => container.value?.parentElement ?? null)

const open = () => {
  const slot = slots.default?.()?.[0]

  if (!parent.value) return
  if (!slot && !props.text) return

  if (props.overflowOnly) {
    const rect = parent.value.getBoundingClientRect()

    if (parent.value.scrollHeight === Math.round(rect.height) && parent.value.scrollWidth === Math.round(rect.width)) return
  }

  Tooltip.add({parent: parent.value, slot, text: props.text, light: props.light})
}

const close = () => {
  Tooltip.close()
}

watch(parent, (newValue, oldValue) => {
  oldValue?.removeEventListener('mouseover', open)
  oldValue?.removeEventListener('mouseleave', close)
  newValue?.addEventListener('mouseover', open)
  newValue?.addEventListener('mouseleave', close)
})

onBeforeUnmount(() => {
  parent.value?.removeEventListener('mouseover', open)
  parent.value?.removeEventListener('mouseleave', close)

  close()
})

</script>
