<template>
  <WSkeleton
    v-if="skeleton && model"
    class="w-option"
  />

  <div
    v-else-if="skeleton"
    class="grid gap-1.5 py-1"
  >
    <WSkeleton class="w-skeleton-h-5" />
    <WSkeleton class="w-skeleton-h-4 w-skeleton-w-48" />
    <WSkeleton class="w-skeleton-h-4 w-skeleton-w-full" />
  </div>

  <!-- In the field: the name with a crop tag, and the unselect button inside it. -->
  <div
    v-else-if="model"
    class="w-option w-option-has-bg bg-tone-soft text-tone grid max-w-max grid-cols-[auto_1fr_auto] items-center gap-1.5"
    :class="option ? cropToneMap[option.crop] : 'tone-data-gray'"
  >
    <span class="bg-tone-fill size-2 rounded-full" />
    <span class="truncate font-semibold">{{ option?.name ?? search }}</span>

    <slot />
  </div>

  <div
    v-else-if="option"
    class="grid max-w-full gap-1 py-1"
  >
    <div class="flex min-w-0 items-center gap-2">
      <span class="text-accent truncate font-semibold">{{ option.name }}</span>

      <span
        class="bg-tone-soft text-tone shrink-0 rounded-full px-2 text-xs font-semibold"
        :class="cropToneMap[option.crop]"
      >{{ option.crop }}</span>

      <span
        v-if="option.heirloom"
        class="tone-data-amber text-tone ml-auto flex shrink-0 items-center gap-1 text-xs font-semibold"
      >
        <IconStar class="square-[1.25em]" />
        Heirloom
      </span>
    </div>

    <div class="text-description text-xs">
      Germinates in {{ option.germination[0] }}–{{ option.germination[1] }} days · first harvest at {{ option.harvest }} days
    </div>

    <div class="flex gap-3 text-xs">
      <span
        class="flex items-center gap-1"
        :class="option.organic ? 'tone-data-green text-tone' : 'text-description'"
      >
        <IconPlant class="square-[1.25em]" />
        {{ option.organic ? 'Organic' : 'Conventional' }}
      </span>

      <span
        class="flex items-center gap-1"
        :class="option.frostHardy ? 'tone-data-cyan text-tone' : 'text-description'"
      >
        <IconSnowflake class="square-[1.25em]" />
        {{ option.frostHardy ? 'Frost-hardy' : 'Frost-tender' }}
      </span>
    </div>

    <!-- The year at a glance: when to sow, when to harvest, and months that are both. -->
    <div class="mt-0.5 flex gap-0.5">
      <span
        v-for="(month, monthIndex) in MONTHS"
        :key="monthIndex"
        class="flex h-4 items-center justify-center rounded-sm text-[0.5625rem] font-semibold px-2"
        :class="monthClass(monthIndex)"
      >
        {{ month }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconPlant from 'eco-vue-js/dist/assets/icons/IconPlant'
import IconSnowflake from 'eco-vue-js/dist/assets/icons/IconSnowflake'
import IconStar from 'eco-vue-js/dist/assets/icons/IconStar'

import {type Variety, cropToneMap} from '../api/garden'

const props = defineProps<SelectOptionProps<Variety>>()

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const monthClass = (month: number) => {
  const sow = props.option?.sowMonths.includes(month)
  const harvest = props.option?.harvestMonths.includes(month)

  // `surface-fill` picks a readable text color for the tone; the split gradient paints over its fill.
  if (sow && harvest) return 'tone-data-teal surface-fill bg-linear-to-br from-data-teal from-50% to-data-amber to-50%'
  if (sow) return 'tone-data-teal surface-fill'
  if (harvest) return 'tone-data-amber surface-fill'
  return 'bg-surface-muted text-subtle'
}
</script>
