<template>
  <WButton
    :semantic-type="SemanticType.SECONDARY"
    :disabled="loadingAccept"
    class="w-full"
    @click.stop.prevent="$emit('cancel')"
  >
    <template v-if="typeof cancelText === 'string'">
      {{ cancelText }}
    </template>

    <component
      :is="cancelText"
      v-else
    />
  </WButton>

  <WButton
    v-if="intermediateText"
    :to="intermediateTo"
    :semantic-type="intermediateSemanticType"
    :loading="loadingIntermediate"
    :disabled="loadingAccept || disabled"
    class="w-full"
    @click.stop.prevent="$emit('intermediate')"
  >
    <template v-if="typeof intermediateText === 'string'">
      {{ intermediateText }}
    </template>

    <component
      :is="intermediateText"
      v-else
    />
  </WButton>

  <WButton
    :to="acceptTo"
    :semantic-type="acceptSemanticType"
    :loading="loadingAccept"
    :disabled="loadingIntermediate || disabled"
    class="w-full"
    @click.stop.prevent="$emit('accept')"
  >
    <template v-if="typeof acceptText === 'string'">
      {{ acceptText }}
    </template>

    <component
      :is="acceptText"
      v-else
    />
  </WButton>
</template>

<script lang="ts" setup>
import type {ConfirmModalProps} from '../../types'

import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'

defineOptions({inheritAttrs: false})

withDefaults(
  defineProps<Pick<ConfirmModalProps, 'acceptText' | 'acceptSemanticType' | 'intermediateText' | 'intermediateSemanticType' | 'cancelText' | 'acceptTo' | 'intermediateTo'> & {
    loadingAccept: boolean
    loadingIntermediate: boolean
    disabled: boolean
  }>(),
  {
    cancelText: 'Cancel',
    acceptText: 'Accept',
    acceptSemanticType: SemanticType.PRIMARY,
    intermediateSemanticType: SemanticType.SECONDARY,
  },
)

defineEmits<{
  (e: 'accept'): void
  (e: 'intermediate'): void
  (e: 'cancel'): void
}>()
</script>
