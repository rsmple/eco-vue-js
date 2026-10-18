<template>
  <div class="grid gap-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <WCard
        v-for="stat in STATS"
        :key="stat.title"
        :title="stat.title"
      >
        <span class="text-accent text-2xl font-semibold tabular-nums">{{ stat.value }}</span>
      </WCard>
    </div>

    <WSection title="Beds">
      <template #actions>
        <WButton :semantic-type="SemanticType.SECONDARY">
          Add bed
        </WButton>
      </template>

      <p class="text-description">
        Each bed groups the plants that share its soil and watering.
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        <WCard title="North bed">
          <span class="text-description text-sm">12 plants, watered daily</span>
        </WCard>

        <WCard title="South bed">
          <span class="text-description text-sm">8 plants, watered every other day</span>
        </WCard>
      </div>
    </WSection>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WCard from 'eco-vue-js/dist/components/Surface/WCard.vue'
import WSection from 'eco-vue-js/dist/components/Surface/WSection.vue'

const STATS = [
  {title: 'Plants', value: 128},
  {title: 'Need water', value: 9},
  {title: 'Beds', value: 6},
]
</script>
