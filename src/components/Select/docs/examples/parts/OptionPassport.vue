<template>
  <WSkeleton
    v-if="skeleton"
    class="w-option w-skeleton-w-48"
  />

  <!-- Three joined segments, each with its own background, so each is a `w-option-has-bg`. -->
  <div
    v-else
    class="w-option flex w-max max-w-full overflow-hidden"
  >
    <div
      class="w-option-has-bg text-accent flex min-w-0 items-center rounded-l-[inherit]"
      :class="{'bg-surface border-line-subtle border-y border-l': !textOnly}"
    >
      <span class="truncate">{{ option?.name ?? search }}</span>
    </div>

    <div
      v-if="option"
      class="w-option-has-bg text-tone flex items-center font-semibold tabular-nums"
      :class="[humidityTone, {'surface-soft border-y border-line-subtle': !textOnly}]"
      :title="`Prefers ${ option.humidity }% air humidity`"
    >
      <IconDrop class="square-[1em] mr-1" />
      {{ option.humidity }}%
    </div>

    <div
      class="w-option-has-bg grid grid-cols-[1fr_auto] items-center gap-1 rounded-r-[inherit] font-semibold capitalize"
      :class="textOnly ? ['text-tone', kindStyle.tone] : ['surface-fill bg-linear-to-r', kindStyle.tone, kindStyle.gradient]"
    >
      <span class="truncate">{{ option?.kind ?? 'new' }}</span>

      <!-- The unselect button lands in the last segment, on the gradient. -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'

import {Kind, type Plant} from '../../../../../../docs/examples/recipes/plant-list/models/Plant'

const props = defineProps<SelectOptionProps<Plant> & {
  /** Colors the text only, without backgrounds — for a plain list or a table cell. */
  textOnly?: boolean
}>()

/** `surface-fill` takes the tone for the text and the unselect button; the gradient paints over its flat fill. */
const kindStyleMap: Record<Kind, {tone: string, gradient: string}> = {
  [Kind.TROPICAL]: {tone: 'tone-data-green', gradient: 'from-data-green to-data-teal'},
  [Kind.SUCCULENT]: {tone: 'tone-data-orange', gradient: 'from-data-orange to-data-pink'},
  [Kind.FERN]: {tone: 'tone-data-teal', gradient: 'from-data-teal to-data-cyan'},
  [Kind.HERB]: {tone: 'tone-data-violet', gradient: 'from-data-violet to-data-fuchsia'},
}

const kindStyle = computed(() => props.option ? kindStyleMap[props.option.kind] : {tone: 'tone-data-gray', gradient: 'from-data-gray to-data-gray'})

const humidityTone = computed(() => {
  if (!props.option || props.option.humidity < 50) return 'tone-data-amber'
  if (props.option.humidity <= 65) return 'tone-data-green'
  return 'tone-data-cyan'
})
</script>
