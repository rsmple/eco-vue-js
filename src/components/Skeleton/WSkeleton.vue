<template>
  <div
    class="tone-primary bg-tone-soft w-skeleton w-skeleton-opacity-50 dark:w-skeleton-opacity-5 before:animate-ticker w-option-has-bg"
    :style="{'--skeleton-width-internal': skeletonWidth + '%'}"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {computed, useId} from 'vue'

defineSlots<{
  /** Content inside the placeholder. With `w-skeleton-w-max` and hidden with `opacity-0`, it sizes the skeleton to the content it stands for. */
  default?: () => void
}>()

const id = useId()

const skeletonWidth = computed(() => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return Math.abs(hash % 41) + 40 // 40-80%
})
</script>