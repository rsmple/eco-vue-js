<template>
  <WButtonMoreItem
    :text="item.available ? 'Mark as borrowed' : 'Mark as returned'"
    :icon="markRaw(item.available ? IconArchiveBook : IconCheckCircle)"
    :disabled="readonly"
    @click="toggle"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconCheckCircle from 'eco-vue-js/dist/assets/icons/IconCheckCircle'

const props = defineProps<MenuProps<Book>>()

defineEmits<MenuEmits<Book>>()

const toggle = () => {
  // In an app this is the PATCH response; `updateItem` puts it into every cached page that holds the item.
  props.updateItem({...props.item, available: !props.item.available})

  Notify.success({title: props.item.available ? 'Marked as borrowed' : 'Marked as returned'})
}
</script>
