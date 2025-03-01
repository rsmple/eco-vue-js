<template>
  <WModalWrapper class="w-modal-wrapper-w-[40rem]">
    <template #title>
      {{ title }}
    </template>

    <div class="text-accent sm-not:-px--inner-margin mb-8 min-h-5 text-balance text-center text-base font-normal">
      {{ description }}
    </div>

    <template #actions>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="loadingAccept"
        class="w-full"
        @click.stop.prevent="cancel"
      >
        {{ cancelText || 'Cancel' }}
      </WButton>

      <WButton
        v-if="intermediateText"
        :semantic-type="intermediateSemanticType ?? SemanticType.SECONDARY"
        :loading="loadingIntermediate"
        :disabled="loadingAccept"
        class="w-full"
        @click.stop.prevent="intermediate"
      >
        {{ intermediateText }}
      </WButton>

      <WButton
        :semantic-type="acceptSemanticType ?? SemanticType.PRIMARY"
        :loading="loadingAccept"
        :disabled="loadingIntermediate"
        class="w-full"
        @click.stop.prevent="accept"
      >
        {{ acceptText || 'Accept' }}
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'

import {SemanticType} from '@/utils/SemanticType'

const props = defineProps<{
  title: string
  description: string
  acceptText?: string
  acceptSemanticType?: SemanticType
  intermediateText?: string
  intermediateSemanticType?: SemanticType
  cancelText?: string
  onAccept: () => void | Promise<void>
  onIntermediate?: () => void | Promise<void>
  onCancel?: () => void
}>()

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

  const promise = props.onAccept()

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
