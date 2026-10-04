<template>
  <WButtonMoreItem
    text="Remove"
    :icon="markRaw(IconTrash)"
    :disabled="readonly"
    @click="remove"
  />
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {handleApiError} from 'eco-vue-js/dist/utils/api'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

import {plantModelApi} from '../api/Plant'

const props = defineProps<MenuProps<Plant>>()

defineEmits<MenuEmits<Plant>>()

// Opened from the row menu, the confirm takes its place — under the `⋯` button, or where the row was right-clicked — and keeps the row highlighted.
const overlay = useOverlay()

const remove = () => {
  overlay.addConfirm({
    title: 'Remove plant',
    description: `"${ props.item.name }" will be removed from the collection.`,
    acceptText: 'Remove',
    acceptSemanticType: SemanticType.NEGATIVE,
    // The confirm shows a loading state until the action resolves, which also drops the plant from every cached page.
    onAccept: () => plantModelApi.item.actions.delete(props.item.id).catch(handleApiError),
  })
}
</script>
