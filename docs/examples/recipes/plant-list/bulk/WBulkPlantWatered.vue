<template>
  <WButtonSelectionAction
    title="Mark as watered"
    :icon="markRaw(IconDrop)"
    :disable-message="disableMessage"
    :disabled="readonly"
    :active="isOpen"
    @click="markWatered"
  />
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import type {BulkProps} from 'eco-vue-js/dist/components/List/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {handleApiError} from 'eco-vue-js/dist/utils/api'

import WButtonSelectionAction from 'eco-vue-js/dist/components/Button/WButtonSelectionAction.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'

import {type QueryParamsPlants, plantModelApi} from '../api/Plant'

const props = defineProps<BulkProps<QueryParamsPlants>>()

defineEmits<{
  (e: 'clear:selected'): void
}>()

const overlay = useOverlay()

const isOpen = ref(false)

const markWatered = (event: MouseEvent) => {
  isOpen.value = true

  overlay.addConfirm({
    title: `Mark ${ props.selectionCount } plant${ props.selectionCount === 1 ? '' : 's' } as watered?`,
    description: 'Their next watering is no longer due.',
    acceptText: 'Mark as watered',
    anchor: event.currentTarget as Element,
    onAccept: () => plantModelApi.paginated.actions.updateMany(props.queryParamsGetter(), {watered: true, waterBy: null})
      .then(() => {
        Notify.success({title: 'Marked as watered'})
      })
      .catch(handleApiError),
  }, () => isOpen.value = false)
}
</script>
