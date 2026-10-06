<template>
  <WButtonMoreItem
    text="Change caretaker"
    :icon="markRaw(IconUser)"
    :disabled="readonly"
    @click="openForm"
  />
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import {defineAsyncComponent, markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {useOverlay} from 'eco-vue-js/dist/utils/Overlay'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconUser from 'eco-vue-js/dist/assets/icons/IconUser'

const PlantCaretakerForm = defineAsyncComponent(() => import('../PlantCaretakerForm.vue'))

const props = defineProps<MenuProps<Plant>>()

defineEmits<MenuEmits<Plant>>()

const overlay = useOverlay()

// The same form as the bulk action. Opened from the row menu, it takes the menu's place and keeps the row highlighted.
const openForm = (event: MouseEvent) => {
  overlay.open({
    present: 'dropdown',
    anchor: event.currentTarget as Element,
    content: markRaw(PlantCaretakerForm),
    props: {
      queryParams: {id__in: [props.item.id]},
      count: 1,
    },
  })
}
</script>
