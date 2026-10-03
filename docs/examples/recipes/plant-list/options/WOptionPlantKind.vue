<template>
  <div class="w-option grid grid-cols-[1fr_auto] items-center gap-2">
    <!-- The same tag as the kind column. -->
    <span
      v-if="option"
      class="bg-tone-soft text-tone flex w-max items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold"
      :class="kindDisplay[option].tone"
    >
      <component
        :is="kindDisplay[option].icon"
        class="square-3.5"
      />
      {{ kindDisplay[option].label }}
    </span>

    <span v-else>{{ search }}</span>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {Kind} from '../models/Plant'

import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import {kindDisplay} from '../models/PlantDisplay'

defineProps<SelectOptionProps<Kind>>()
</script>
