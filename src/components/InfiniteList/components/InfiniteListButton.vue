<template>
  <div class="sm:-left--left-inner sm:-max-w--width-inner flex w-full items-center justify-center p-12 sm:sticky">
    <WButton
      :semantic-type="SemanticType.SECONDARY"
      @click="$emit('click')"
    >
      More
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue'

import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'check'): void
}>()

onMounted(() => {
  emit('check')
})
</script>
