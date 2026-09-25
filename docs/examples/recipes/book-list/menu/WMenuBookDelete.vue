<template>
  <WButtonMoreItem
    text="Remove"
    :icon="markRaw(IconTrash)"
    :disabled="readonly"
    @click="remove"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

const props = defineProps<MenuProps<Book>>()

defineEmits<MenuEmits<Book>>()

const remove = () => {
  Modal.addConfirm({
    title: 'Remove book',
    description: `"${ props.item.title }" will be removed from the catalogue.`,
    acceptText: 'Remove',
    acceptSemanticType: SemanticType.NEGATIVE,
    // In an app, await the DELETE request here — the modal shows a loading state until it resolves.
    onAccept: () => props.deleteItem(),
  })
}
</script>
