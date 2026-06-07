<template>
  <div class="flex justify-end gap-4 pt-5">
    <WButton
      :semantic-type="SemanticType.SECONDARY"
      :disabled="disabled"
      class="basis-32"
      @mousedown.prevent=""
      @click="$emit('cancel')"
    >
      Cancel
    </WButton>

    <WButton
      :semantic-type="SemanticType.PRIMARY"
      :loading="loading"
      :disabled="disabled"
      class="basis-32"
      @mousedown.prevent=""
      @click="$emit('save')"
    >
      Save
    </WButton>
  </div>
</template>

<script lang="ts" setup>
import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'

defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'cancel'): void
  (e: 'save'): void
}>()
</script>
