<template>
  <div
    class="relative isolate h-8 w-full overflow-hidden rounded-xl bg-gray-100 text-sm font-semibold tabular-nums select-none dark:bg-gray-800"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="modelValue === null ? undefined : Math.round(modelValue * 100)"
    :aria-busy="modelValue === null || modelValue < 1"
  >
    <template v-if="modelValue !== null">
      <div
        class="absolute inset-y-0 left-0 overflow-hidden rounded-xl transition-[width] duration-500 ease-out"
        :class="progressBarClass[semanticType]"
        :style="{width: percent}"
      >
        <!-- A light sweeps the fill while the task runs. -->
        <div
          v-if="modelValue < 1"
          class="animate-ticker absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent [--tiker-duration:1.6s]"
        />
      </div>

      <div class="text-accent relative flex h-full items-center justify-center">
        {{ percent }}
      </div>

      <!-- The same label in the fill's color, cut to the filled part, so it reads on both sides of the edge. -->
      <div
        aria-hidden="true"
        class="absolute inset-0 flex items-center justify-center transition-[clip-path] duration-500 ease-out"
        :class="progressBarTextClass[semanticType]"
        :style="{clipPath: `inset(0 calc(100% - ${ percent }) 0 0)`}"
      >
        {{ percent }}
      </div>
    </template>

    <template v-else>
      <div
        class="animate-ticker absolute inset-0 bg-linear-to-r from-transparent to-transparent [--tiker-duration:1.4s]"
        :class="progressBarIndeterminateClass[semanticType]"
      />

      <div class="text-description relative flex h-full items-center justify-center gap-2 font-medium">
        <WSpinner class="square-4" />

        <span>In progress</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import WSpinner from '@/components/Spinner/WSpinner.vue'

import {SemanticType} from '@/utils/SemanticType'
import {percentCompactFormatter} from '@/utils/utils'

import {progressBarClass, progressBarIndeterminateClass, progressBarTextClass} from './utils/progressBarClass'

const props = withDefaults(
  defineProps<{
    /** Filled part, from 0 to 1, shown as a percentage. `null` sweeps the empty bar and shows a spinner, for progress not known yet. */
    modelValue: number | null
    /** Color scheme of the fill. */
    semanticType?: SemanticType
  }>(),
  {
    semanticType: SemanticType.INFO,
  },
)

const percent = computed(() => percentCompactFormatter.format(Math.min(Math.max(props.modelValue ?? 0, 0), 1)))
</script>
