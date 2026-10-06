<template>
  <WButton
    v-if="!first"
    :disabled="submitting"
    :semantic-type="SemanticType.SECONDARY"
    class="w-full"
    @click="$emit('previous')"
  >
    {{ getText('back') }}
  </WButton>

  <WButton
    v-else-if="closable"
    :disabled="submitting"
    :semantic-type="SemanticType.SECONDARY"
    class="w-full"
    @click="$emit('close')"
  >
    {{ hasChanges ? getText('cancel') : getText('close') }}
  </WButton>

  <WButton
    :semantic-type="SemanticType.PRIMARY"
    :loading="submitting"
    :disabled="disabledNext"
    class="w-full"
    @click="last ? $emit('submit') : $emit('next')"
  >
    {{ last ? submitText ?? getText('submit') : getText('next') }}
  </WButton>
</template>

<script lang="ts" setup>
import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'
import {getText} from '@/utils/texts'

// Buttons of a stepper: Back, or Close on the first step — Cancel once something is changed — and Next, or the submit on the last.
defineProps<{
  first: boolean
  last: boolean
  /** On the first step there is something to close, such as the overlay the stepper is in. */
  closable: boolean
  hasChanges: boolean
  submitting: boolean
  disabledNext: boolean
  submitText: string | undefined
}>()

defineEmits<{
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'submit'): void
  (e: 'close'): void
}>()
</script>
