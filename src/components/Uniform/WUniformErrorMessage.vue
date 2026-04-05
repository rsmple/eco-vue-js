<template>
  <div v-if="typeof message === 'string'">
    {{ message }}
  </div>
  <div v-else-if="message">
    <div v-if="message.title || typeof message.message[0] === 'string'">
      {{ message.title ? `${message.title}: ` : '' }}{{ message.message.join(', ') }}
    </div>

    <div
      v-if="typeof message.message[0] !== 'string'"
      :class="message.title ? 'ps-4' : undefined"
    >
      <WUniformErrorMessage
        v-for="(item, index) in message.message"
        :key="index"
        :message="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {ValidateResponse} from './types'

defineProps<{
  message: ValidateResponse | string
}>()
</script>