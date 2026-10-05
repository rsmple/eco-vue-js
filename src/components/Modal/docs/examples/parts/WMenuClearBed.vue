<template>
  <WButtonMoreItem
    text="Clear bed"
    :icon="markRaw(IconTrash)"
    :semantic-type="SemanticType.NEGATIVE"
    @click="confirmClear"
  />
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

const emit = defineEmits<{
  (e: 'status', value: string): void
}>()

// Opened from a menu, the confirm takes its place at the menu's anchor — the `⋯` button, or the point a row was right-clicked.
const overlay = useOverlay()

const confirmClear = () => {
  overlay.addConfirm({
    title: 'Clear the bed?',
    description: 'Every plant in it is moved to the compost.',
    acceptText: 'Clear',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: () => emit('status', 'Cleared from the menu.'),
    onCancel: () => emit('status', 'Cancelled.'),
  })
}
</script>
