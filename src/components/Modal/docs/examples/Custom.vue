<template>
  <WButton @click="rename">
    Rename “{{ name }}”
  </WButton>
</template>

<script lang="ts" setup>
import {defineAsyncComponent, markRaw, ref} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'

// Loaded on first open, so the modal's code stays out of the page bundle.
const RenameModal = defineAsyncComponent(() => import('./RenameModal.vue'))

const name = ref('Roadmap')

const rename = () => {
  Modal.add(markRaw(RenameModal), {
    name: name.value,
    onSave: (value: string) => name.value = value,
  })
}
</script>
