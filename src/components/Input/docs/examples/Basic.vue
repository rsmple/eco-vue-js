<template>
  <div class="grid max-w-md gap-2">
    <WInput
      v-model="name"
      title="Name"
      placeholder="Jane Austen"
      allow-clear
    />

    <WInput
      v-model="search"
      placeholder="Search"
      :icon="IconSearch"
      allow-clear
    />

    <WInput
      v-model="year"
      type="number"
      title="Year"
      :min="0"
      :max="2100"
    />

    <WInput
      v-model="notes"
      title="Notes"
      textarea
      resize
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

const name = ref<string>()
const search = ref<string>()
const year = ref<number>()
const notes = ref<string>()
</script>
