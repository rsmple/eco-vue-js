<template>
  <WButtonSelectionAction
    title="Remove"
    :icon="markRaw(IconTrash)"
    :disable-message="disableMessage"
    :disabled="readonly"
    :active="isOpen"
    @click="remove"
  />
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import type {BulkProps} from 'eco-vue-js/dist/components/List/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {handleApiError} from 'eco-vue-js/dist/utils/api'

import WButtonSelectionAction from 'eco-vue-js/dist/components/Button/WButtonSelectionAction.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

import {type QueryParamsPlants, plantModelApi} from '../api/Plant'

const props = defineProps<BulkProps<QueryParamsPlants>>()

const emit = defineEmits<{
  (e: 'clear:selected'): void
}>()

const overlay = useOverlay()

const isOpen = ref(false)

const remove = (event: MouseEvent) => {
  isOpen.value = true

  overlay.addConfirm({
    title: `Remove ${ props.selectionCount } plant${ props.selectionCount === 1 ? '' : 's' }?`,
    description: 'They will be removed from the collection.',
    acceptText: 'Remove',
    acceptSemanticType: SemanticType.NEGATIVE,
    // Opens under the button, or under More when the action sits in that menu, so the selected rows stay in view.
    anchor: event.currentTarget as Element,
    // The page is held still until the request settles, so the selection cannot change under it.
    onAccept: () => plantModelApi.paginated.actions.deleteMany(props.queryParamsGetter())
      .then(() => {
        Notify.success({title: 'Plants removed'})
        emit('clear:selected')
      })
      .catch(handleApiError),
  }, () => isOpen.value = false)
}
</script>
