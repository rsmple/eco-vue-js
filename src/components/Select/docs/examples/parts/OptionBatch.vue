<template>
  <!-- The placeholder takes the shape of what it stands for: one line in the field, a card in the menu. -->
  <WSkeleton
    v-if="skeleton && model"
    class="w-option w-skeleton-w-56"
  />

  <div
    v-else-if="skeleton"
    class="grid gap-1.5 py-1"
  >
    <WSkeleton class="w-skeleton-h-5" />
    <WSkeleton class="w-skeleton-h-5 w-skeleton-w-32" />
    <WSkeleton class="w-skeleton-h-1.5 w-skeleton-w-full" />
  </div>

  <div
    v-else-if="option"
    class="w-option grid content-center gap-1.5"
  >
    <!-- The first line is the whole option in the field. -->
    <div class="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
      <span class="text-accent truncate">
        <span class="font-semibold">{{ option.bed }}</span> · sown {{ dateFormatter.format(option.sownAt) }}
      </span>

      <span class="tone-data-green text-tone text-xs font-semibold tabular-nums">+{{ option.sprouted }}</span>
      <span
        class="text-xs font-semibold tabular-nums"
        :class="option.lost ? 'tone-data-red text-tone' : 'text-subtle'"
      >−{{ option.lost }}</span>

      <slot />
    </div>

    <template v-if="!model">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="crop in option.crops"
          :key="crop"
          class="bg-tone-soft text-tone rounded-full px-2 text-xs font-semibold"
          :class="cropToneMap[crop]"
        >
          {{ crop }}
        </span>
      </div>

      <!-- How the tray is doing: sprouted, still waiting, lost. -->
      <div class="flex h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          v-for="part in parts"
          :key="part.label"
          :class="part.class"
          :style="{width: `${ part.value / total * 100 }%`}"
        />
      </div>

      <div class="text-description flex gap-3 text-xs">
        <span
          v-for="part in parts"
          :key="part.label"
          class="flex items-center gap-1"
        >
          <span
            class="size-2 rounded-full"
            :class="part.class"
          />
          {{ part.value }} {{ part.label }}
        </span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {type Batch, cropToneMap} from '../api/garden'

const props = defineProps<SelectOptionProps<Batch>>()

const dateFormatter = Intl.DateTimeFormat('en', {day: 'numeric', month: 'short'})

const parts = computed(() => props.option
  ? [
    {label: 'sprouted', value: props.option.sprouted, class: 'bg-data-green'},
    {label: 'waiting', value: props.option.waiting, class: 'bg-data-amber'},
    {label: 'lost', value: props.option.lost, class: 'bg-data-red'},
  ]
  : [])

const total = computed(() => parts.value.reduce((sum, part) => sum + part.value, 0) || 1)
</script>
