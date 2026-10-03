<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <div v-else>
    <!-- Two joined segments: the plant, and what it does on a colored fill that holds the unselect button. -->
    <div class="w-option flex w-max max-w-full overflow-hidden">
      <span
        class="w-option-has-bg bg-surface border-line-subtle text-accent flex min-w-0 items-center rounded-l-[inherit] border-y border-l"
      >
        <span class="truncate">{{ option.name }}</span>
      </span>

      <span
        class="w-option-has-bg surface-fill flex items-center gap-1 rounded-r-[inherit] text-sm font-semibold whitespace-nowrap"
        :class="option.tone"
      >
        <component
          :is="option.icon"
          class="square-[1.25em] shrink-0"
        />
        {{ option.role }}

        <slot />
      </span>
    </div>

    <div
      v-if="!model"
      class="text-description text-xs mt-1"
    >
      {{ option.description }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

export type Companion = {id: number, name: string, role: string, description: string, tone: string, icon: SVGComponent}

defineProps<SelectOptionProps<Companion>>()
</script>
