<template>
  <WModalWrapper
    :actions-col="actionsCol"
    :maximized="maximized"
    class="w-modal-wrapper-w-(--w-modal-confirm-width,40rem)"
    :class="wrapperClass"
  >
    <template #title>
      <template v-if="typeof title === 'string'">
        {{ title }}
      </template>

      <component
        :is="title"
        v-else
      />
    </template>

    <div class="text-accent mb-6 min-h-5 text-balance text-center font-normal">
      <template v-if="typeof description === 'string'">
        {{ description }}
      </template>

      <component
        :is="description"
        v-else
        @update:disabled="disabledInner = $event"
      />
    </div>

    <template #actions>
      <ConfirmActions
        :accept-text="acceptText"
        :accept-semantic-type="acceptSemanticType"
        :accept-to="acceptTo"
        :intermediate-text="intermediateText"
        :intermediate-semantic-type="intermediateSemanticType"
        :intermediate-to="intermediateTo"
        :cancel-text="cancelText"
        :loading-accept="loadingAccept"
        :loading-intermediate="loadingIntermediate"
        :disabled="disabledInner"
        @accept="accept"
        @intermediate="intermediate"
        @cancel="cancel"
      />
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import type {ConfirmModalProps} from '../../types'

import WModalWrapper from '@/components/Modal/WModalWrapper.vue'

import ConfirmActions from './ConfirmActions.vue'

import {useConfirm} from '../../use/useConfirm'

const props = defineProps<ConfirmModalProps>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const {disabledInner, loadingAccept, loadingIntermediate, accept, intermediate, cancel} = useConfirm(props, () => emit('close:modal'))
</script>
