<template>
  <WHeaderBarSearch v-if="search">
    <template #default="{visible, hide}">
      <div>
        <WInputSuggest
          v-if="filterSearch && isMobile"
          ref="input"
          :model-value="(queryParams as Record<string, string>).search"
          :autofocus="visible"
          placeholder="Search.."
          allow-clear
          persist
          teleport
          no-margin
          class="w-full"
          :icon="markRaw(IconSearch)"
          @click:clear="inputRef?.close"
          @close="!(queryParams as Record<string, string>).search && hide?.()"
          @update:model-value="$emit('update:query-params', {search: $event || undefined} as QueryParams)"
        >
          <template #content>
            <component
              :is="filterSearch" 
              :query-params="queryParams"
              @update:query-params="$emit('update:query-params', $event)"
            />
          </template>
        </WInputSuggest>

        <WInput
          v-else
          ref="input"
          :model-value="(queryParams as Record<string, string>).search"
          :autofocus="visible"
          placeholder="Search.."
          allow-clear
          no-margin
          class="w-full"
          :icon="markRaw(IconSearch)"
          @blur="!(queryParams as Record<string, string>).search && hide?.()"
          @click:clear="hide"
          @update:model-value="$emit('update:query-params', {search: $event || undefined} as QueryParams)"
        >
          <template
            v-if="filterSearch"
            #right
          >
            <component
              :is="filterSearch" 
              :query-params="queryParams"
              @update:query-params="$emit('update:query-params', $event)"
            />
          </template>
        </WInput>
      </div>
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
      @toggle="open = open === index ? null : index"
      @update:query-params="$emit('update:query-params', $event)"
    />

    <div class="my-8 h-0.5 rounded bg-gray-400" />

    <div class="grid grid-cols-2 gap-4">
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

import {computed, markRaw, ref, useTemplateRef} from 'vue'

import WActionsBarFilter from '@/components/ActionsBar/WActionsBarFilter.vue'
import WButton from '@/components/Button/WButton.vue'
import WHeaderBarSearch from '@/components/HeaderBar/WHeaderBarSearch.vue'
import WInput from '@/components/Input/WInput.vue'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'

import IconFilterRemove from '@/assets/icons/sax/IconFilterRemove.svg?component'
import IconSearch from '@/assets/icons/sax/IconSearch.svg?component'

import {Modal} from '@/utils/Modal'
import {SemanticType} from '@/utils/SemanticType'
import {useIsMobile} from '@/utils/mobile'

import ListFilterGlobalItem from './ListFilterGlobalItem.vue'

defineProps<{
  filter: FilterComponent<QueryParams>[] | undefined
  filterSearch: FilterComponent<QueryParams> | undefined
  search: boolean
  queryParams: QueryParams
}>()

const emit = defineEmits<{
  (e: 'update:query-params', value: QueryParams): void
}>()

const {isMobile} = useIsMobile()

const open = ref<number | null>(null)

const inputRef = useTemplateRef<ComponentInstance<typeof WInputSuggest>>('input')
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