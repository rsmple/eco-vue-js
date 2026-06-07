<template>
  <WUniform
    v-bind="(scope as unknown as UniformScope<{search?: string}>)"
    field="search"
  >
    <template #field="scopeField">
      <WInput
        v-bind="scopeField"
        placeholder="Search.."
        allow-clear
        class="w-full"
        :no-margin="global"
        :icon="markRaw(IconSearch)"
        :autofocus="autofocus"
        @click:clear="$emit('close')"
      />
    </template>
  </WUniform>
</template>

<script lang="ts" setup generic="QueryParams">
import type {FilterEmits, FilterProps} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {markRaw} from 'vue'

import WInput from '@/components/Input/WInput.vue'
import WUniform from '@/components/Uniform/WUniform.vue'

import IconSearch from '@/assets/icons/IconSearch.svg?component'

defineProps<FilterProps<QueryParams> & {autofocus?: boolean}>()

defineEmits<FilterEmits>()
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