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
        :summarized="summarized"
        :count="count"
        :is-open="isOpen"
        :shrink="shrink"
        :remove-label="readonly ? undefined : pinned ? (count ? getText('clearFilter') : undefined) : getText('removeFilter')"
        @toggle="$emit('toggle')"
        @remove="$emit('remove')"
      >
        <WListFilterSummary
          :filter="item"
          :query-params="scope.modelValue"
          :limit="VALUES_SHOWN"
        />
      </ListFilterChip>
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
import {getFilterCount, getFilterMeta, getMetaValue, hasFilterSummary} from '@/utils/listFilter'
import {getText} from '@/utils/texts'

import ListFilterChip from './ListFilterChip.vue'

import WListFilterSummary from '../WListFilterSummary.vue'

const VALUES_SHOWN = 2

const props = defineProps<{
  scope: UniformScope<QueryParams>
  item: FilterComponent<QueryParams>
  isOpen: boolean
  pinned: boolean
  readonly: boolean
  /** Lets the chip shrink, truncating its values, when it does not fit the bar. */
  shrink?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'close'): void
  (e: 'remove'): void
}>()

// A filter applies as it changes, so a pick in an embedded single select inside is done with it, and closes it.
provide(wCloseOverlayOnPick, true)

const meta = computed(() => getFilterMeta(props.item))

const title = computed(() => getMetaValue(meta.value.title, props.scope.modelValue))

const icon = computed(() => getMetaValue(meta.value.icon, props.scope.modelValue))

const count = computed(() => getFilterCount(meta.value, props.scope.modelValue))

const summarized = computed(() => hasFilterSummary(meta.value, props.scope.modelValue))
</script>
