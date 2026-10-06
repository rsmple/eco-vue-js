<template>
  <WButtonSelectionAction
    title="Change caretaker"
    :icon="markRaw(IconUser)"
    :disable-message="disableMessage"
    :disabled="readonly"
    :active="isOpen"
    @click="openForm"
  />
</template>

<script lang="ts" setup>
import {defineAsyncComponent, markRaw, ref} from 'vue'

import type {BulkProps} from 'eco-vue-js/dist/components/List/types'
import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'

import WButtonSelectionAction from 'eco-vue-js/dist/components/Button/WButtonSelectionAction.vue'

import IconUser from 'eco-vue-js/dist/assets/icons/IconUser'

import {type QueryParamsPlants} from '../api/Plant'

const PlantCaretakerForm = defineAsyncComponent(() => import('../PlantCaretakerForm.vue'))

const props = defineProps<BulkProps<QueryParamsPlants>>()

const overlay = useOverlay()

const isOpen = ref(false)

// The form opens at the button, so the selected rows stay in view.
const openForm = (event: MouseEvent) => {
  isOpen.value = true

  overlay.open({
    present: 'dropdown',
    anchor: event.currentTarget as Element,
    content: markRaw(PlantCaretakerForm),
    props: {
      queryParams: props.queryParamsGetter(),
      count: props.selectionCount,
      // A function, not an emit: in the More menu this component is gone by now, as the form took the menu's place.
      onSaved: props.clearSelection,
    },
    onClose: () => isOpen.value = false,
  })
}
</script>
