<template>
  <div class="flex w-full p-12 justify-center items-center">
    <WButton
      :semantic-type="SemanticType.SECONDARY"
      @click="$emit('click')"
    >
      More
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from '@/utils/SemanticType'
import WButton from '@/components/Button/WButton.vue'

defineEmits<{
  (e: 'click'): void
}>()

</script>
