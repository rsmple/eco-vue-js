<template>
  <div
    v-if="!removable || active"
    v-show="active"
    ref="element"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {nextTick, useTemplateRef, watch} from 'vue'

import {useTabItemActiveListener} from '../use/useTabItemActiveListener'

const props = defineProps<{
  active: boolean
  removable: boolean
}>()

const emit = defineEmits<{
  (e: 'update:height', value: number): void
  (e: 'update:active'): void
}>()

const {callListeners} = useTabItemActiveListener()

const elementRef = useTemplateRef('element')

const emitHeight = (): void => {
  if (!elementRef.value) return

  emit('update:height', elementRef.value.offsetHeight)
}

watch(() => props.active, async value => {
  if (value) emit('update:active')

  if (value) await nextTick()

  emitHeight()

  if (value) callListeners()
}, {immediate: true})

defineExpose({
  emitHeight,
})
</script>