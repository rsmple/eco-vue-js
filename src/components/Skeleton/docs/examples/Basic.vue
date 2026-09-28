<template>
  <div class="grid max-w-md gap-4">
    <WToggle
      v-model="loading"
      title="Loading"
    />

    <div class="flex items-center gap-4 rounded-xl border border-solid border-gray-200 p-4 dark:border-gray-800">
      <WSkeleton
        v-if="loading"
        class="w-skeleton-w-12 w-skeleton-h-12 w-skeleton-rounded-full shrink-0"
      />

      <div
        v-else
        class="bg-primary dark:bg-primary-dark text-default flex square-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
      >
        JA
      </div>

      <div class="grid flex-1">
        <WSkeleton v-if="loading" />

        <span
          v-else
          class="font-semibold"
        >
          Jane Austen
        </span>

        <WSkeleton v-if="loading" />

        <span
          v-else
          class="text-description"
        >
          Pride and Prejudice, Emma, Persuasion
        </span>
      </div>

      <WChip
        text="Author"
        :skeleton="loading"
      />
    </div>

    <div class="flex items-center gap-4">
      <WSpinner />
      <WSpinner class="w-spinner-size-5 text-primary dark:text-primary-dark" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WSpinner from 'eco-vue-js/dist/components/Spinner/WSpinner.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

const loading = ref(true)
</script>
