<template>
  <!-- Shown while the selected plant loads by id, and for options on pages still loading. -->
  <WSkeleton
    v-if="skeleton"
    class="w-option w-skeleton-w-48"
  />

  <div
    v-else
    class="w-option grid grid-cols-[auto_1fr_auto] items-center gap-2"
  >
    <span
      class="bg-tone-fill size-2.5 rounded-full"
      :class="option ? kindToneMap[option.kind] : 'tone-data-gray'"
    />

    <span class="truncate">
      {{ option?.name ?? search }} <span
        v-if="option"
        class="text-description italic"
      >{{ option.species }}</span>
    </span>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {Kind, type Plant} from '../../../../../../docs/examples/recipes/plant-list/models/Plant'

defineProps<SelectOptionProps<Plant>>()

const kindToneMap: Record<Kind, string> = {
  [Kind.TROPICAL]: 'tone-data-green',
  [Kind.SUCCULENT]: 'tone-data-orange',
  [Kind.FERN]: 'tone-data-teal',
  [Kind.HERB]: 'tone-data-violet',
}
</script>
