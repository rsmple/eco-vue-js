<template>
  <WInputOptions
    v-model="country"
    title="Country"
    placeholder="Start typing"
    :options="filtered"
    :value-getter="option => option.name"
    empty-stub="No such country"
    allow-clear
    class="max-w-md"
  >
    <template #option="{option}">
      <div class="w-option flex items-center">
        {{ option.flag }} {{ option.name }}
      </div>
    </template>
  </WInputOptions>

  <p class="text-sm text-description">
    Model: {{ country || '—' }}
  </p>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'

import WInputOptions from 'eco-vue-js/dist/components/Input/WInputOptions.vue'

const countries = [
  {id: 1, name: 'Austria', flag: '🇦🇹'},
  {id: 2, name: 'Belgium', flag: '🇧🇪'},
  {id: 3, name: 'Denmark', flag: '🇩🇰'},
  {id: 4, name: 'France', flag: '🇫🇷'},
  {id: 5, name: 'Germany', flag: '🇩🇪'},
  {id: 6, name: 'Norway', flag: '🇳🇴'},
]

const country = ref<string | null>()

const filtered = computed(() => countries.filter(item => item.name.toLowerCase().includes(country.value?.toLowerCase() ?? '')))
</script>
