<template>
  <button
    ref="closeButton"
    class="absolute left-0 top-0 -z-10 size-full cursor-pointer outline-none"
    aria-label="Close modal"
    @click="$emit('click', $event)"
  />
</template>

<script lang="ts" setup>
import {onMounted, useTemplateRef} from 'vue'

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()

const closeButtonRef = useTemplateRef('closeButton')

onMounted(() => {
  closeButtonRef.value?.focus()
})
</script>