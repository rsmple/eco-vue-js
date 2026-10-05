<template>
  <WModalWrapper
    maximized
    class="sm:w-modal-wrapper-w-160"
  >
    <template #title>
      {{ form?.isCreate ? form.currentTitle : form?.name || 'Plant' }}
    </template>

    <template
      v-if="form?.isCreate"
      #subtitle
    >
      <WProgress :model-value="form.progress" />
    </template>

    <PlantForm
      ref="form"
      :plant-id="plantId"
      @saved="onSaved?.($event); $emit('close:modal')"
    />

    <!-- Steps get Back and Next until the last one; editing gets Cancel and Save on every tab. -->
    <template #actions>
      <WButton
        v-if="!form?.isCreate || form.first"
        :disabled="form?.submitting"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="$emit('close:modal')"
      >
        {{ form?.hasChanges ? 'Cancel' : 'Close' }}
      </WButton>

      <WButton
        v-else
        :disabled="form.submitting"
        :semantic-type="SemanticType.SECONDARY"
        class="w-full"
        @click="form.previous()"
      >
        Back
      </WButton>

      <WButton
        v-if="form?.isCreate && !form.last"
        class="w-full"
        @click="form.next()"
      >
        Next
      </WButton>

      <WButton
        v-else
        :disabled="!form?.isCreate && !form?.hasChanges"
        :loading="form?.submitting"
        class="w-full"
        @click="form?.submit()"
      >
        {{ form?.isCreate ? 'Add plant' : 'Save' }}
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup>
import type {Plant} from '../plant-list/models/Plant'

import {useTemplateRef} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WModalWrapper from 'eco-vue-js/dist/components/Modal/WModalWrapper.vue'
import WProgress from 'eco-vue-js/dist/components/Progress/WProgress.vue'

import PlantForm from './PlantForm.vue'

defineProps<{
  /** The plant to edit. Without it, the modal walks through creating one. */
  plantId?: number
  onSaved?: (plant: Plant) => void
}>()

defineEmits<{
  (e: 'close:modal'): void
}>()

const form = useTemplateRef('form')

// The modal reads `formRef.hasChanges` to ask before it closes with unsaved changes.
defineExpose({formRef: form})
</script>
