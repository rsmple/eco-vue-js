<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- A tag in the field, with the unselect button inside its background; the menu adds what the scanner checks. -->
  <div
    v-else-if="model"
    class="tone-primary bg-tone/10 text-tone w-option w-option-has-bg grid max-w-max grid-cols-[1fr_auto] items-center gap-1 font-semibold"
  >
    <span class="truncate">{{ option.name }}</span>

    <slot />
  </div>

  <div
    v-else
    class="w-option w-option-has-bg grid w-full py-1"
  >
    <span class="tone-primary text-tone font-semibold">{{ option.name }}</span>
    <span class="text-description text-xs">{{ option.description }}</span>
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<SelectOptionProps<{id: number, name: string, description: string}>>()
</script>
