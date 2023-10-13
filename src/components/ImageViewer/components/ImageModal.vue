<template>
  <div class="relative flex flex-col items-center">
    <div class="relative">
      <button
        class="p-3 rounded-full absolute -top-14 right-3 sm:-right-14 w-ripple w-ripple-hover outline-none"
        @click="$emit('close:modal')"
      >
        <IconCancel class="text-description" />
      </button>
      <img
        :src="modelValue"
        :alt="name"
        class="shadow-md dark:shadow-sm dark:shadow-gray-600 max-w-[100vw] max-h-[90vh]"
      >
    </div>

    <div class="text-center mt-3">
      {{ name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

const props = defineProps<{
  modelValue: string
  resolve?: () => void
}>()

defineEmits<{
  (e: 'close:modal'): void
}>()

const name = computed(() => props.modelValue.substring(props.modelValue.lastIndexOf('/') + 1))

</script>