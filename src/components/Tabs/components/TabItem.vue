<template>
  <div
    v-show="isActive"
    ref="element"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {ref, watch, toRef, nextTick} from 'vue'

const props = defineProps<{
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'update:height', value: number): void
}>()

const element = ref<HTMLDivElement | undefined>()

const emitHeight = (): void => {
  if (!element.value) return

  emit('update:height', element.value.offsetHeight)
}

watch(toRef(props, 'isActive'), async value => {
  if (value) await nextTick()

  emitHeight()
}, {immediate: true})

defineExpose({
  emitHeight,
})

</script>