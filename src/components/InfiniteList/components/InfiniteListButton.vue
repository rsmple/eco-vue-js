<template>
  <div class="flex w-full p-12 last:pb-0 justify-center items-center">
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
import WButton from '@whitespots/ui-kit/dist/components/Button/WButton.vue'

defineEmits<{
  (e: 'click'): void
}>()

</script>
