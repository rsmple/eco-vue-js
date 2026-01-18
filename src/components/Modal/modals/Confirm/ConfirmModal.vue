<template>
  <WModalWrapper
    :actions-col="actionsCol"
    class="w-modal-wrapper-w-[--w-modal-confirm-width,40rem]"
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

    <div class="text-accent sm-not:-px--inner-margin mb-6 min-h-5 text-balance text-center font-normal">
      <template v-if="typeof description === 'string'">
        {{ description }}
      </template>

      <component
        :is="description"
        v-else
      />
    </div>

    <template #actions>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="loadingAccept"
        class="w-full"
        @click.stop.prevent="cancel"
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
        :disabled="loadingAccept"
        class="w-full"
        @click.stop.prevent="intermediate"
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
        :disabled="loadingIntermediate"
        class="w-full"
        @click.stop.prevent="accept"
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
  </WModalWrapper>
</template>

<script lang="ts" setup>
import type {ConfirmModalProps} from '../../types'

import {ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'

import {SemanticType} from '@/utils/SemanticType'

const props = withDefaults(
  defineProps<ConfirmModalProps>(),
  {
    cancelText: 'Cancel',
    acceptText: 'Accept',
    acceptSemanticType: SemanticType.PRIMARY,
    intermediateSemanticType: SemanticType.SECONDARY,
  },
)

const loadingAccept = ref(false)
const loadingIntermediate = ref(false)

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const intermediate = () => {
  if (loadingIntermediate.value || loadingAccept.value) return

  const promise = props.onIntermediate?.()

  if (promise) {
    loadingIntermediate.value = true

    promise
      .then(() => {
        emit('close:modal')
      })
      .finally(() => {
        loadingIntermediate.value = false
      })
  } else {
    emit('close:modal')
  }
}

const accept = () => {
  if (loadingIntermediate.value || loadingAccept.value) return

  const promise = props.onAccept?.()

  if (promise) {
    loadingAccept.value = true

    promise
      .then(() => {
        emit('close:modal')
      })
      .finally(() => {
        loadingAccept.value = false
      })
  } else {
    emit('close:modal')
  }
}

const cancel = () => {
  props.onCancel?.()

  emit('close:modal')
}
</script>
