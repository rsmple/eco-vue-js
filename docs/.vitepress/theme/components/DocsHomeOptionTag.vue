<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- Each tag brings its own tone and icon, with the unselect button inside the background. -->
  <div
    v-else
    class="w-option w-option-has-bg bg-tone-soft text-tone grid max-w-max grid-cols-[auto_1fr_auto] items-center gap-1.5 font-semibold"
    :class="option.tone"
  >
    <component
      :is="option.icon"
      class="square-[1.25em] shrink-0"
    />
    <span class="truncate">{{ option.name }}</span>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

export type Tag = {id: number, name: string, tone: string, icon: SVGComponent}

defineProps<SelectOptionProps<Tag>>()
</script>
