<template>
  <div class="flex flex-wrap items-center gap-2">
    <WButton
      :semantic-type="SemanticType.NEGATIVE"
      @click="confirmClear"
    >
      Clear bed
    </WButton>

    <WButtonMore>
      <WMenuClearBed @status="status = $event" />
    </WButtonMore>
  </div>

  <p class="mt-2 text-sm text-description">
    {{ status }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WButtonMore from 'eco-vue-js/dist/components/Button/WButtonMore.vue'

import WMenuClearBed from './parts/WMenuClearBed.vue'

const status = ref('Nothing happened yet.')

const overlay = useOverlay()

const confirmClear = (event: Event) => {
  overlay.addConfirm({
    title: 'Clear the bed?',
    description: 'Every plant in it is moved to the compost.',
    acceptText: 'Clear',
    acceptSemanticType: SemanticType.NEGATIVE,
    // The clicked button.
    anchor: event.currentTarget as Element,
    // The page is held still while the promise is pending.
    onAccept: () => new Promise<void>(resolve => setTimeout(resolve, 1000)).then(() => {
      status.value = 'Cleared.'
    }),
    onCancel: () => {
      status.value = 'Cancelled.'
    },
  })
}
</script>
