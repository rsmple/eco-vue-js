<template>
  <WFormValidator name="search">
    <WInput
      ref="input"
      :model-value="(queryParams as Record<string, string>).search"
      placeholder="Search.."
      allow-clear
      class="w-full"
      :no-margin="global"
      :icon="markRaw(IconSearch)"
      @click:clear="$emit('close')"
      @update:model-value="$emit('update:query-params', {search: $event || undefined})"
    />
  </WFormValidator>
</template>

<script lang="ts" setup generic="QueryParams">
import type {FilterEmits, FilterProps} from '../types'

import {markRaw} from 'vue'

import WFormValidator from '@/components/Form/WFormValidator.vue'
import WInput from '@/components/Input/WInput.vue'

import IconSearch from '@/assets/icons/IconSearch.svg?component'

defineProps<FilterProps<QueryParams>>()

defineEmits<FilterEmits<QueryParams, typeof meta.fields[number]>>()
</script>

<script lang="ts">
export const meta = {
  title: 'Search',
  icon: markRaw(IconSearch),
  fields: [
    'search',
  ] as Extract<keyof Record<string, unknown>, `search${ string }`>[],
}
</script>