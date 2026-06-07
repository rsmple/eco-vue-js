<template>
  <div
    class="
      bg-primary-light dark:bg-primary-darkest relative isolate h-8 w-full
      overflow-hidden rounded-2xl border border-solid
    "
    :class="progressBarBorderClass[semanticType]"
  >
    <template v-if="modelValue !== null">
      <div
        class="absolute z-10 h-full overflow-hidden transition-[width] [--tiker-duration:1s]"
        :class="{
          [progressBarClass[semanticType]]: true,
          'w-progress-striped before:animate-move-horizontal': modelValue !== 1,
        }"
        :style="{width: (modelValue * 100) + '%'}"
      />

      <div class="text-accent relative left-0 top-0 z-20 flex size-full items-center justify-center text-lg font-semibold">
        {{ percentCompactFormatter.format(modelValue) }}
      </div>
    </template>

    <template v-else>
      <div class="text-accent w-progress-striped before:animate-move-horizontal relative flex h-full items-center justify-center gap-2">
        <span>In progress</span> <WSpinner class="w-spinner-size-6" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import WSpinner from '@/components/Spinner/WSpinner.vue'

import {SemanticType} from '@/utils/SemanticType'
import {percentCompactFormatter} from '@/utils/utils'

import {progressBarBorderClass, progressBarClass} from './utils/progressBarClass'

withDefaults(
  defineProps<{
    modelValue: number | null
    semanticType?: SemanticType
  }>(),
  {
    semanticType: SemanticType.INFO,
  },
)
</script>