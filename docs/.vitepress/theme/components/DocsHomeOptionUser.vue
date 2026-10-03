<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- In the field it is one line, so the input keeps its height; the menu adds the role and the last week of watering. -->
  <div
    v-else
    class="w-option w-option-has-bg grid grid-cols-[auto_1fr_auto] items-center gap-2 pl-1"
    :class="{'w-full py-1': !model}"
  >
    <span
      class="surface-fill flex shrink-0 items-center justify-center rounded-full font-semibold"
      :class="[option.tone, model ? 'size-5 text-[0.625rem]' : 'size-8 text-xs']"
    >
      {{ option.name.split(' ').map(part => part[0]).join('') }}
    </span>

    <span
      v-if="model"
      class="truncate"
    >{{ option.name }}</span>

    <template v-else>
      <span class="grid min-w-0">
        <span class="truncate">{{ option.name }}</span>
        <span class="text-description truncate text-xs">{{ option.role }}</span>
      </span>

      <!-- One bar a day, filled on the days they watered. -->
      <span
        class="flex items-end gap-0.5"
        :class="option.tone"
        :title="`Watered ${ option.week.filter(Boolean).length } of the last 7 days`"
      >
        <span
          v-for="(watered, day) in option.week"
          :key="day"
          class="w-1 rounded-full"
          :class="watered ? 'bg-tone-fill h-4' : 'bg-line h-1.5'"
        />
      </span>
    </template>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<SelectOptionProps<{id: number, name: string, role: string, tone: string, week: boolean[]}>>()
</script>
