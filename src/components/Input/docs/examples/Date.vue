<template>
  <WInputDate
    v-model="date"
    title="Due date"
    :min-date="new Date()"
    class="max-w-md"
  />

  <p class="text-sm text-gray-500">
    Model: {{ date?.toDateString() ?? '—' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInputDate from 'eco-vue-js/dist/components/Input/WInputDate.vue'

const date = ref<Date>()
</script>
