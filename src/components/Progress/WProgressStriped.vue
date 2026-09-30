<template>
  <div
    class="relative w-full overflow-hidden rounded-full bg-gray-200 select-none dark:bg-gray-800"
    :class="{'cursor-progress': modelValue < 100}"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="modelValue > 0 ? Math.min(modelValue, 100) : undefined"
    :aria-busy="modelValue < 100"
  >
    <!-- Waiting to start: a band sweeps the empty track. -->
    <div
      v-if="modelValue <= 0"
      class="animate-ticker via-primary/60 dark:via-primary-dark/70 absolute inset-0 bg-linear-to-r from-transparent to-transparent [--tiker-duration:1.4s]"
    />

    <div
      v-else
      class="from-primary-dark to-primary relative h-full overflow-hidden rounded-full bg-linear-to-r transition-[width] duration-500 ease-out"
      :style="{width: Math.min(modelValue, 100) + '%'}"
    >
      <!-- Running: a light sweeps the fill. Done: the full bar pulses. -->
      <div
        class="absolute inset-0"
        :class="modelValue < 100
          ? 'animate-ticker bg-linear-to-r from-transparent via-white/40 to-transparent [--tiker-duration:1.6s]'
          : 'bg-default/30 animate-pulse'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Filled part, from 0 to 100. At 0 a band sweeps the empty track, while waiting to start; at 100 the full bar pulses. */
  modelValue: number
}>()
</script>
