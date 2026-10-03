<template>
  <WSkeleton
    v-if="skeleton"
    class="w-option"
  />

  <!-- Each option brings its own tone; a typed one, not created yet, has no option and falls back to the search text. -->
  <div
    v-else
    class="w-option w-option-has-bg bg-tone-soft text-tone grid max-w-max grid-cols-[auto_1fr_auto] items-center gap-1.5 font-semibold"
    :class="option?.tone ?? 'tone-data-gray'"
  >
    <component
      :is="option?.icon ?? IconTag"
      class="square-[1.25em] shrink-0"
    />

    <span class="truncate">{{ option?.name ?? search }}</span>

    <!-- The select puts its unselect button here, for a chosen tag in the field. -->
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconTag from 'eco-vue-js/dist/assets/icons/IconTag'

export type Light = {
  id: string
  name: string
  tone: string
  icon?: SVGComponent
}

defineProps<SelectOptionProps<Light>>()
</script>
