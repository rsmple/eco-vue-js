<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- A filled pill in the field; the menu puts the icon in a soft circle and adds what the state looks like. -->
  <div
    v-else-if="model"
    class="w-option w-option-has-bg surface-fill grid max-w-max grid-cols-[auto_1fr_auto] items-center gap-1.5 font-semibold"
    :class="option.tone"
  >
    <component
      :is="option.icon"
      class="square-[1.25em] shrink-0"
    />
    <span class="truncate">{{ option.name }}</span>

    <slot />
  </div>

  <div
    v-else
    class="w-option grid w-full grid-cols-[auto_1fr] items-center gap-x-2.5 py-1"
    :class="option.tone"
  >
    <span class="surface-soft text-tone row-span-2 flex size-8 items-center justify-center rounded-full">
      <component
        :is="option.icon"
        class="square-4.5"
      />
    </span>
    <span class="text-tone font-semibold">{{ option.name }}</span>
    <span class="text-description text-xs">{{ option.description }}</span>
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

export type Health = {id: string, name: string, description: string, tone: string, icon: SVGComponent}

defineProps<SelectOptionProps<Health>>()
</script>
