<template>
  <WButtonSelectionAction
    title="Mark as dry"
    :icon="markRaw(IconSun)"
    :disable-message="disableMessage"
    :disabled="readonly"
    :active="isOpen"
    @click="markDry"
  />
</template>

<script lang="ts" setup>
import {markRaw, ref} from 'vue'

import type {BulkProps} from 'eco-vue-js/dist/components/List/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {handleApiError} from 'eco-vue-js/dist/utils/api'
import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButtonSelectionAction from 'eco-vue-js/dist/components/Button/WButtonSelectionAction.vue'

import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import {type QueryParamsPlants, plantModelApi} from '../api/Plant'

const props = defineProps<BulkProps<QueryParamsPlants>>()

defineEmits<{
  (e: 'clear:selected'): void
}>()

const overlay = useOverlay()

const isOpen = ref(false)

const markDry = (event: MouseEvent) => {
  isOpen.value = true

  overlay.addConfirm({
    title: `Mark ${ props.selectionCount } plant${ props.selectionCount === 1 ? '' : 's' } as dry?`,
    description: 'They will need water within three days.',
    acceptText: 'Mark as dry',
    anchor: event.currentTarget as Element,
    // Dry soil needs water within three days.
    onAccept: () => plantModelApi.paginated.actions.updateMany(props.queryParamsGetter(), {watered: false, waterBy: addDay(getStartOfDay(), 3)})
      .then(() => {
        Notify.success({title: 'Marked as dry'})
      })
      .catch(handleApiError),
  }, () => isOpen.value = false)
}
</script>
