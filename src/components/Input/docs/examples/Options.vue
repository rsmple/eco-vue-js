<template>
  <WInputOptions
    v-model="plant"
    title="Plant"
    placeholder="Start typing"
    :options="filtered"
    :value-getter="option => option.name"
    empty-stub="No such plant"
    allow-clear
    class="max-w-md"
  >
    <template #option="{option}">
      <div class="w-option flex items-center">
        {{ option.emoji }} {{ option.name }}
      </div>
    </template>
  </WInputOptions>

  <p class="text-sm text-description">
    Model: {{ plant || '—' }}
  </p>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'

import WInputOptions from 'eco-vue-js/dist/components/Input/WInputOptions.vue'

const plants = [
  {id: 1, name: 'Cactus', emoji: '🌵'},
  {id: 2, name: 'Clover', emoji: '🍀'},
  {id: 3, name: 'Rose', emoji: '🌹'},
  {id: 4, name: 'Sunflower', emoji: '🌻'},
  {id: 5, name: 'Tulip', emoji: '🌷'},
  {id: 6, name: 'Hibiscus', emoji: '🌺'},
]

const plant = ref<string | null>()

const filtered = computed(() => plants.filter(item => item.name.toLowerCase().includes(plant.value?.toLowerCase() ?? '')))
</script>
