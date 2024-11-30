<template>
  <div
    v-show="isActive"
    ref="element"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {nextTick, toRef, useTemplateRef, watch} from 'vue'

import {useTabItemActiveListener} from '../use/useTabItemActiveListener'

const props = defineProps<{
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'update:height', value: number): void
}>()

const {callListeners} = useTabItemActiveListener()

const elementRef = useTemplateRef('element')

const emitHeight = (): void => {
  if (!elementRef.value) return

  emit('update:height', elementRef.value.offsetHeight)
}

watch(toRef(props, 'isActive'), async value => {
  if (value) await nextTick()

  emitHeight()

  if (value) callListeners()
}, {immediate: true})

defineExpose({
  emitHeight,
})
</script>