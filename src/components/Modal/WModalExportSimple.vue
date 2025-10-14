<template>
  <WModalWrapper class="w-modal-wrapper-w-[40rem]">
    <template #title>
      {{ title }}
    </template>

    <template #actions>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="loading"
        class="flex-1"
        @click="$emit('close:modal')"
      >
        {{ cancelText ?? 'Close' }}
      </WButton>

      <WButton
        :href="urlToBlob"
        :download="`${fileName}_${new Date().toISOString()}.json`"
        :semantic-type="SemanticType.PRIMARY"
        :disabled="!data"
        :loading="loading"
        tag="a"
        class="flex-1"
        @click="handleDownload"
      >
        {{ downloadText ?? 'Download' }}
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup generic="Model">
import {computed, onMounted, ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'

import {SemanticType} from '@/utils/SemanticType'
import {handleApiError} from '@/utils/api'

const props = defineProps<{
  fileName: string
  title: string
  cancelText?: string
  downloadText?: string
  apiMethod: () => Promise<Model>
  resolve?: () => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const loading = ref(true)
const data = ref<Model | null>(null)

const blob = computed<Blob | undefined>(() => {
  if (!data.value) return

  return new Blob([JSON.stringify(data.value)], {type: 'application/json'})
})

const urlToBlob = computed<string | undefined>(() => blob.value ? URL.createObjectURL(blob.value) : undefined)

const handleDownload = (): void => {
  loading.value = true

  setTimeout(() => {
    loading.value = false

    props.resolve?.()

    emit('close:modal')
  }, 500)
}

onMounted(() => {
  props.apiMethod()
    .then(response => {
      data.value = response
    })
    .catch(handleApiError)
    .finally(() => {
      loading.value = false
    })
})
</script>