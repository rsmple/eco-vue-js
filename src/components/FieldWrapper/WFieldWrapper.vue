<template>
  <div class="mt-1 mb-4">
    <div
      class="text-accent text-xs font-semibold mb-2"
      :class="{
        'opacity-50': disabled,
      }"
    >
      {{ title }}
    </div>

    <div class="text-base font-normal min-h-[2.75rem] flex items-center border-t border-solid border-gray-300 dark:border-gray-700">
      <WSkeleton v-if="skeleton" />

      <slot v-else>
        {{ modelValue }}
      </slot>
    </div>

    <div
      v-if="description"
      class="text-xs font-normal text-description pt-4 whitespace-pre-wrap break-words"
    >
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

defineProps<{
  modelValue?: string
  title: string
  description?: string
  skeleton?: boolean
  disabled?: boolean
}>()

</script>
