<template>
  <WInputAsync
    v-model="email"
    title="Email"
    placeholder="name@example.com"
    :validate="[required, isEmail]"
    class="max-w-md"
  />

  <p class="text-sm text-gray-500">
    Saved value: {{ email || '—' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInputAsync from 'eco-vue-js/dist/components/Input/WInputAsync.vue'

const email = ref<string>()

const required: ValidateFn = value => value ? undefined : 'Required'
const isEmail: ValidateFn = value => typeof value === 'string' && value.includes('@') ? undefined : 'Not an email'
</script>
