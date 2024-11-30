<template>
  <button
    ref="closeButton"
    class="absolute left-0 top-0 -z-10 size-full cursor-pointer outline-none"
    title="Click outside to close modal"
    @click="$emit('click', $event)"
  />
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()

const closeButton = ref<HTMLButtonElement | undefined>()

onMounted(() => {
  closeButton.value?.focus()
})
</script>