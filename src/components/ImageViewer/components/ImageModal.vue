<template>
  <div class="relative flex flex-col items-center">
    <div class="relative">
      <button
        class="w-ripple w-ripple-hover absolute -top-14 right-3 rounded-full p-3 outline-none sm:-right-14"
        @click="$emit('close:modal')"
      >
        <IconCancel class="text-description" />
      </button>
      <img
        :src="modelValue"
        :alt="name"
        class="max-h-[90vh] max-w-[100vw] shadow-md dark:shadow-sm dark:shadow-gray-600"
      >
    </div>

    <div class="mt-3 text-center">
      {{ name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import IconCancel from '@/assets/icons/IconCancel.svg?component'

const props = defineProps<{
  modelValue: string
  resolve?: () => void
}>()

defineEmits<{
  (e: 'close:modal'): void
}>()

const name = computed(() => props.modelValue.substring(props.modelValue.lastIndexOf('/') + 1))
</script>