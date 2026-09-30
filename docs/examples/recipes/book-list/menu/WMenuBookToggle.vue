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
import {handleApiError} from 'eco-vue-js/dist/utils/api'
import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconCheckCircle from 'eco-vue-js/dist/assets/icons/IconCheckCircle'

import {bookModelApi} from '../api/Book'

const props = defineProps<MenuProps<Book>>()

defineEmits<MenuEmits<Book>>()

const toggle = () => bookModelApi.item.actions
  // The action puts the saved book into every cached page that holds it, so the row updates without a refetch.
  .update(props.item.id, {
    available: !props.item.available,
    // Borrowed for two weeks.
    dueAt: props.item.available ? addDay(getStartOfDay(), 14) : null,
  })
  .then(book => Notify.success({title: book.available ? 'Marked as returned' : 'Marked as borrowed'}))
  .catch(handleApiError)
</script>
