<template>
  <div class="w-option grid grid-cols-[auto_1fr_auto] items-center gap-2">
    <!-- The same avatar as the caretaker column. -->
    <span
      class="surface-fill flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold"
      :class="option?.tone ?? 'tone-data-gray'"
    >
      {{ option?.name.split(' ').map(part => part[0]).join('') }}
    </span>

    <span class="truncate">{{ option?.name ?? search }}</span>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import type {Caretaker} from '../models/Plant'

import type {SelectOptionProps} from 'eco-vue-js/dist/components/Select/types'

defineProps<SelectOptionProps<Caretaker>>()
</script>
