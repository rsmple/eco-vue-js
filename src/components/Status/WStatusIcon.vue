<template>
  <IconNegativeInfo
    v-if="hasError"
    class="tone-negative text-tone"
  />
  <IconCheckCircle
    v-else-if="hasValue"
    class="tone-positive text-tone"
  />
  <IconSlash
    v-else
    class="text-description opacity-50"
  />
</template>

<script setup lang="ts">
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg?component'
import IconNegativeInfo from '@/assets/icons/IconNegativeInfo.svg?component'
import IconSlash from '@/assets/icons/IconSlash.svg?component'

defineProps<{
  /** Shows a green check. */
  hasValue?: boolean
  /** Shows a red exclamation mark, over `hasValue`. */
  hasError?: boolean
}>()
</script>
