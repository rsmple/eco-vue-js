<template>
  <WSkeleton
    v-if="skeleton || !option"
    class="w-option w-option-has-bg"
  />

  <!-- In the field it is one line, so the input keeps its height; the menu shows the email and role as well. -->
  <div
    v-else
    class="w-option w-option-has-bg pl-1 grid grid-cols-[auto_1fr_auto] items-center gap-2"
    :class="{'w-full py-1': !model}"
  >
    <span
      class="tone-primary surface-fill flex shrink-0 items-center justify-center rounded-full font-semibold"
      :class="model ? 'size-5 text-[0.625rem]' : 'size-8 text-xs'"
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
      <span class="truncate">{{ option.name }}</span>
      <span class="text-description truncate text-xs">{{ option.email }} · {{ option.role }}</span>
    </span>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<SelectOptionProps<{id: number, name: string, email: string, role: string}>>()
</script>
