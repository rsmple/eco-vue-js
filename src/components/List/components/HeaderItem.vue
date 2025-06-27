<template>
  <div
    ref="element"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup generic="Field">
import {onMounted, useTemplateRef} from 'vue'

const emit = defineEmits<{
  (e: 'update:width', value: number): void
}>()

const elementRef = useTemplateRef('element')

onMounted(() => {
  if (elementRef.value) emit('update:width', elementRef.value.offsetWidth)
})
</script>
