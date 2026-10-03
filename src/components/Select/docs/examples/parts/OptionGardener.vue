<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- One line in the field, so it keeps the input's height; the menu adds the role and fills the row, pushing the count right. -->
  <div
    v-else
    class="w-option w-option-has-bg grid grid-cols-[auto_1fr_auto] items-center gap-2"
    :class="model ? 'w-option-has-bg' : undefined"
  >
    <span
      class="surface-fill flex shrink-0 items-center justify-center rounded-full font-semibold -ml-2"
      :class="[toneOf(option.name), model ? 'size-5 text-[0.625rem]' : 'size-8 text-xs']"
    >
      {{ option.name.split(' ').map(part => part[0]).join('') }}
    </span>

    <span
      v-if="model"
      class="truncate"
    >{{ option.name }}</span>

    <span
      v-else
      class="grid min-w-0"
    >
      <span class="text-accent truncate">{{ option.name }}</span>
      <span class="text-description truncate text-xs">{{ option.role }}</span>
    </span>

    <span
      v-if="!model"
      class="text-description bg-surface-muted rounded-full px-2 text-xs whitespace-nowrap"
    >
      {{ option.beds }} beds
    </span>
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

export type Gardener = {
  id: number
  name: string
  role: string
  beds: number
}

defineProps<SelectOptionProps<Gardener>>()

const TONES = ['tone-data-green', 'tone-data-teal', 'tone-data-amber', 'tone-data-violet', 'tone-data-pink', 'tone-data-cyan']

/** The same name always gets the same color. */
const toneOf = (name: string) => TONES[[...name].reduce((hash, char) => hash + char.charCodeAt(0), 0) % TONES.length]
</script>
