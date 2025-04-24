<template>
  <WHeaderBarSearch
    v-if="search"
    :shown="!!(queryParams as Record<string, string>).search"
  >
    <template #default="{visible, hide}">
      <component
        :is="filterSearch ?? ListFilterSearch"
        :query-params="queryParams"
        :autofocus="!(queryParams as Record<string, string>).search && visible"
        global
        @update:query-params="$emit('update:query-params', $event)"
        @close="!(queryParams as Record<string, string>).search && hide?.()"
      />
    </template>
  </WHeaderBarSearch>

  <WActionsBarFilter
    v-if="filter"
    :count="count"
  >
    <ListFilterGlobalItem
      v-for="(item, index) in filter"
      :key="index"
      ref="filterItem"
      :item="item"
      :query-params="queryParams"
      :is-open="open === index"
      :disabled-filter-fields="disabledFilterFields"
      class="-px--inner-margin"
      @toggle="open = open === index ? null : index"
      @update:query-params="$emit('update:query-params', $event)"
    />

    <div class="-mx--inner-margin my-8 h-0.5 rounded bg-gray-400" />

    <div class="-px--inner-margin grid grid-cols-2 gap-4">
      <slot name="bottom" />

      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="!count"
        class="col-start-2"
        @click="openConfirmReset"
      >
        <IconFilterRemove /> Reset Filters
      </WButton>
    </div>
  </WActionsBarFilter>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'

import {computed, ref, useTemplateRef} from 'vue'

import WActionsBarFilter from '@/components/ActionsBar/WActionsBarFilter.vue'
import WButton from '@/components/Button/WButton.vue'
import WHeaderBarSearch from '@/components/HeaderBar/WHeaderBarSearch.vue'

import IconFilterRemove from '@/assets/icons/sax/IconFilterRemove.svg?component'

import {Modal} from '@/utils/Modal'
import {SemanticType} from '@/utils/SemanticType'

import ListFilterGlobalItem from './ListFilterGlobalItem.vue'
import ListFilterSearch from './ListFilterSearch.vue'

defineProps<{
  filter: FilterComponent<QueryParams>[] | undefined
  filterSearch: FilterComponent<QueryParams> | undefined
  search: boolean
  queryParams: QueryParams
  disabledFilterFields: Array<keyof QueryParams>
}>()

const emit = defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
}>()

const open = ref<number | null>(null)

const filterItemRef = useTemplateRef<ComponentInstance<typeof ListFilterGlobalItem>[]>('filterItem')

const count = computed(() => filterItemRef.value?.filter(item => item.hasChanges).length ?? 0)

let closeModal: (() => void) | null = null

const openConfirmReset = () => {
  closeModal?.()

  closeModal = Modal
    .addConfirm(
      {
        title: 'Are you sure?',
        description: 'Do you want to reset filters?',
        acceptText: 'Reset Filters',
        onAccept: () => {
          closeModal = null

          const result = {}

          filterItemRef.value?.forEach(item => {
            Object.assign(result, item.getDefaultQuery())
          })

          emit('update:query-params', result as QueryParams)
        },
      },
    )
}
</script>