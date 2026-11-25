<template>
  <span class="inline-flex min-w-0 max-w-full items-center gap-1.5 align-bottom">
    <span
      :title="values.join(', ')"
      class="truncate"
    >
      {{ valuesShown.join(', ') }}
    </span>

    <span
      v-if="hiddenCount"
      class="bg-current/12 min-w-[1.75em] shrink-0 rounded-full px-1.5 text-center text-xs/5 font-semibold tabular-nums"
    >
      +{{ numberFormatter.format(hiddenCount) }}
    </span>
  </span>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import {numberFormatter} from '@/utils/utils'

const props = defineProps<{
  /** Picked values, such as option titles. */
  values: string[]
  /** How many values to name before a "+N" badge. All of them when unset. */
  limit?: number
}>()

const valuesShown = computed(() => props.limit === undefined ? props.values : props.values.slice(0, props.limit))

const hiddenCount = computed(() => props.values.length - valuesShown.value.length)
</script>
