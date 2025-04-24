<template>
  <WFormValidator name="search">
    <WInput
      ref="input"
      :model-value="(queryParams as Record<string, string>).search"
      placeholder="Search.."
      allow-clear
      class="w-full"
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

import IconSearch from '@/assets/icons/sax/IconSearch.svg?component'

withDefaults(defineProps<FilterProps<QueryParams>>(), {
  fields: () => fields,
  title: 'Search',
  icon: markRaw(IconSearch),
})

defineEmits<FilterEmits<QueryParams, typeof fields[number]>>()
</script>

<script lang="ts">
const fields = [
  'search',
] as Extract<keyof Record<string, unknown>, `search${ string }`>[]
</script>