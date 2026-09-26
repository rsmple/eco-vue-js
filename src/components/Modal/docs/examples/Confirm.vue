<template>
  <WButton
    :semantic-type="SemanticType.NEGATIVE"
    @click="confirmDelete"
  >
    Delete project
  </WButton>

  <p class="mt-2 text-sm text-gray-500">
    {{ status }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

const status = ref('Nothing happened yet.')

const confirmDelete = () => {
  Modal.addConfirm({
    title: 'Delete project?',
    description: 'The project and its history are removed for everyone.',
    acceptText: 'Delete',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: () => {
      status.value = 'Deleted.'
    },
    onCancel: () => {
      status.value = 'Cancelled.'
    },
  })
}
</script>
