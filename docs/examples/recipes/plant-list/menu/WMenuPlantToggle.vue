<template>
  <WButtonMoreItem
    :text="item.watered ? 'Mark as dry' : 'Mark as watered'"
    :icon="markRaw(item.watered ? IconSun : IconDrop)"
    :disabled="readonly"
    @click="toggle"
  />
</template>

<script lang="ts" setup>
import type {Plant} from '../models/Plant'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {handleApiError} from 'eco-vue-js/dist/utils/api'
import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconDrop from 'eco-vue-js/dist/assets/icons/IconDrop'
import IconSun from 'eco-vue-js/dist/assets/icons/IconSun'

import {plantModelApi} from '../api/Plant'

const props = defineProps<MenuProps<Plant>>()

defineEmits<MenuEmits<Plant>>()

const toggle = () => plantModelApi.item.actions
  // The action puts the saved plant into every cached page that holds it, so the row updates without a refetch.
  .update(props.item.id, {
    watered: !props.item.watered,
    // Dry soil needs water within three days.
    waterBy: props.item.watered ? addDay(getStartOfDay(), 3) : null,
  })
  .then(plant => Notify.success({title: plant.watered ? 'Marked as watered' : 'Marked as dry'}))
  .catch(handleApiError)
</script>
