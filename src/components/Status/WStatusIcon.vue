<template>
  <IconNegativeInfo
    v-if="hasError"
    class="text-negative dark:text-negative-dark"
  />
  <IconCheckCircle
    v-else-if="hasValue"
    class="text-positive dark:text-positive-dark"
  />
  <IconSlash
    v-else
    class="text-description opacity-50"
  />
</template>

<script setup lang="ts">
import IconCheckCircle from '@/assets/icons/sax/IconCheckCircle.svg?component'
import IconNegativeInfo from '@/assets/icons/sax/IconNegativeInfo.svg?component'
import IconSlash from '@/assets/icons/sax/IconSlash.svg?component'

defineProps<{
  hasValue?: boolean
  hasError?: boolean
}>()
</script>
