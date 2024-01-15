<template>
  <button
    ref="closeButton"
    class="cursor-pointer absolute top-0 left-0 h-full w-full -z-10 outline-none"
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