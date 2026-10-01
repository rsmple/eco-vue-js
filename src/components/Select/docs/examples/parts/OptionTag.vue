<template>
  <WSkeleton
    v-if="skeleton"
    class="w-option"
  />

  <div
    v-else
    class="tone-primary w-option w-option-has-bg tone-primary bg-tone/10 text-tone grid max-w-max grid-cols-[1fr_auto] items-center gap-1 font-semibold"
  >
    <div class="truncate">
      {{ option?.name ?? search }}
    </div>

    <!-- The select puts its unselect button here, for a chosen tag in the field. -->
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<SelectOptionProps<{id: number, name: string}>>()
</script>
