<template>
  <div v-if="typeof message === 'string'">
    {{ message }}
  </div>
  <div v-else-if="message">
    <div v-if="message.title || typeof message.message[0] === 'string'">
      - {{ message.title ? `${message.title}: ` : '' }}{{ typeof message.message[0] === 'string' ? message.message.join(', ') : '' }}
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
  /** Validation result of a form: a message, or the messages of its fields by title, nested for nested forms. */
  message: ValidateResponse | string
}>()
</script>