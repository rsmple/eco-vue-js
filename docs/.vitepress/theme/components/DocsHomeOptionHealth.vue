<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- A coloured tag in the field; the menu adds what it looks like. -->
  <div
    v-else-if="model"
    class="w-option w-option-has-bg bg-tone/10 text-tone grid max-w-max grid-cols-[1fr_auto] items-center gap-1 font-semibold"
    :class="option.tone"
  >
    <span class="truncate">{{ option.name }}</span>

    <slot />
  </div>

  <div
    v-else
    class="w-option w-option-has-bg grid w-full grid-cols-[auto_1fr] items-center gap-x-2 py-1"
    :class="option.tone"
  >
    <span class="bg-tone-fill row-span-2 size-2.5 rounded-full" />
    <span class="text-tone font-semibold">{{ option.name }}</span>
    <span class="text-description text-xs">{{ option.description }}</span>
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<SelectOptionProps<{id: string, name: string, description: string, tone: string}>>()
</script>
