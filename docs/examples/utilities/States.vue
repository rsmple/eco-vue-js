<template>
  <div class="grid max-w-md gap-4">
    <div class="flex flex-wrap gap-x-6">
      <WToggle
        v-model="readonly"
        title="Readonly"
      />

      <WToggle
        v-model="skeleton"
        title="Skeleton"
      />
    </div>

    <PlantShelf
      :readonly="readonly"
      :skeleton="skeleton"
    >
      <PlantBadge
        v-for="name in plants"
        :key="name"
        :name="name"
        @water="watered = name"
      />

      <PlantBadge
        name="Cactus"
        :readonly="false"
        @water="watered = 'Cactus'"
      />
    </PlantShelf>

    <span
      v-if="watered"
      class="text-description text-sm"
    >
      Watered {{ watered }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import PlantBadge from './parts/PlantBadge.vue'
import PlantShelf from './parts/PlantShelf.vue'

const plants = ['Basil', 'Fern']

const readonly = ref(false)
const skeleton = ref(false)
const watered = ref<string>()
</script>
