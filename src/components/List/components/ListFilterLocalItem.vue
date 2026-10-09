<template>
  <!-- A small form titled by the filter's name: the frame pads it, and an embedded select or option list inside reaches its edges. -->
  <WDropdownAdaptive
    :is-open="isOpen"
    dialog
    @close="$emit('close')"
  >
    <template #toggle>
      <ListFilterChip
        :title="title"
        :icon="icon"
        :values="values"
        :count="count"
        :is-open="isOpen"
        :remove-label="readonly ? undefined : pinned ? (count ? 'Clear filter' : undefined) : 'Remove filter'"
        @toggle="$emit('toggle')"
        @remove="$emit('remove')"
      />
    </template>

    <template #header>
      <component
        :is="icon"
        v-if="icon"
        class="square-[1.25em]"
      />

      <span>{{ title }}</span>
    </template>

    <template #content>
      <div class="text-start font-normal">
        <component
          :is="item[0].default"
          v-if="Array.isArray(item)"
          v-bind="item[1]"
          :scope="scope"
          :readonly="readonly"
          :global="false"
        />

        <component
          :is="item.default"
          v-else
          :scope="scope"
          :readonly="readonly"
          :global="false"
        />
      </div>
    </template>
  </WDropdownAdaptive>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {computed, provide} from 'vue'

import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'

import {wCloseOverlayOnPick} from '@/components/Select/models/useCloseOnPick'

import ListFilterChip from './ListFilterChip.vue'

import {getMetaValue} from '../models/utils'

const props = defineProps<{
  scope: UniformScope<QueryParams>
  item: FilterComponent<QueryParams>
  isOpen: boolean
  pinned: boolean
  readonly: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'close'): void
  (e: 'remove'): void
}>()

// A filter applies as it changes, so a pick in an embedded single select inside is done with it, and closes it.
provide(wCloseOverlayOnPick, true)

const meta = computed(() => Array.isArray(props.item) ? props.item[0].meta : props.item.meta)

const title = computed(() => getMetaValue(meta.value.title, props.scope.modelValue))

const icon = computed(() => getMetaValue(meta.value.icon, props.scope.modelValue))

const count = computed(() => (meta.value.fields ?? []).reduce((sum, field) => {
  const value = props.scope.modelValue[field]

  if (Array.isArray(value)) return sum + value.length

  return value === undefined || value === null ? sum : sum + 1
}, 0))

const values = computed<string[] | undefined>(() => {
  const summary = meta.value.summary?.(props.scope.modelValue)

  if (summary === undefined) return undefined

  const list = Array.isArray(summary) ? summary : [summary]

  return list.length ? list : undefined
})
</script>
