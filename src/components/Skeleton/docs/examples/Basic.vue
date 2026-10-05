<template>
  <div class="grid max-w-md gap-4">
    <WToggle
      v-model="loading"
      title="Loading"
    />

    <div class="flex items-center gap-4 rounded-xl border border-solid border-line-subtle p-4">
      <WSkeleton
        v-if="loading"
        class="w-skeleton-w-12 w-skeleton-h-12 w-skeleton-rounded-full shrink-0"
      />

      <div
        v-else
        class="tone-primary surface-fill flex square-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
      >
        CL
      </div>

      <div class="grid flex-1">
        <WSkeleton v-if="loading" />

        <span
          v-else
          class="font-semibold"
        >
          Carl Linnaeus
        </span>

        <WSkeleton v-if="loading" />

        <span
          v-else
          class="text-description"
        >
          Herb bed, greenhouse, orchard
        </span>
      </div>

      <WChip
        text="Gardener"
        :skeleton="loading"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const loading = ref(true)
</script>
