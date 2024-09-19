<template>
  <WInfiniteList
    :use-query-fn="useQueryFn"
    :query-params="(queryParams as QueryParams)"
    :skeleton-length="count ?? listCount"
    :header-margin="isMobile ? 0 : 24"
    :is-invalid-page="isInvalidPage"
    hide-page-title
    transition
    page-class="grid sm:gap-4"

    :allow-select="allowSelect"
    allow-select-range
    :selected="selected"
    :reverse="reverse"
    :selected-range="selectedRange"
    :page-length="PAGE_LENGTH"
    :count="count ?? listCount"
    @select="setSelected"
    @select-reverse="setSelectedReverse"
    @select-range="setSelectedRange"

    @update:header-padding="$emit('update:header-padding', $event)"
    @update:count="listCount = $event"
  >
    <template #header="{selectAllValue}">
      <WButtonSelection
        v-if="allowSelect"
        :title="selectionTitle"
        :disable-message="bulkDisableMessage"
        @update:selection-count="selectionCount = $event"
      >
        <template #default="{disableMessage, cssClass}">
          <template
            v-for="(item, index) in bulk"
            :key="index"
          >
            <component
              :is="item"
              :selection-count="selectionCount"
              :query-params-getter="getQueryParamsBulk"
              :disable-message="disableMessage"
              :class="cssClass"
              @clear:selected="setSelected([])"
            />
          </template>
        </template>
      </WButtonSelection>

      <WListHeader
        v-if="!isMobile"
        class="sm-not:hidden"
        :query-params="queryParams"
        :allow-select="allowSelect"
        :tooltip-text="selectAllTextGetter(selectAllValue !== true, count ?? listCount)"

        :count="count ?? listCount"
        :selection="selectAllValue"
        @toggle:selection="$event ? setSelectedReverse([]) : setSelected([])"
      >
        <WListHeaderItem
          v-for="(field, index) in fields"
          :key="index"
          :title="typeof field.title === 'string' ? field.title : field.title((queryParams as QueryParams))"
          :field="field.field"
          :class="[field.cssClass, index === fields.length - 1 ? 'z-[1]' : undefined]"
          :ordering="ordering"
          :disabled="!field.field"
        />
      </WListHeader>
    </template>

    <template #default="{item, skeleton, setter, refetch}">
      <WListCard
        :disabled="skeleton"
        :mobile="isMobile"
        :class="cardClass"
      >
        <template
          v-for="(field, index) in fields"
          :key="index"
        >
          <component
            :is="field.component"
            :item="item"
            :readonly="readonlyGetter?.(item)"
            :class="field.cssClass"
            :skeleton="skeleton"
            @update:item="setter"
            @delete:item="setter(); refetch()"
          />
        </template>

        <template #more>
          <template
            v-for="(menuItem, menuIndex) in menu"
            :key="menuIndex"
          >
            <component
              :is="menuItem"
              :item="item"
              :readonly="readonlyGetter?.(item)"
              @update:item="setter"
              @delete:item="setter(); refetch()"
            />
          </template>
        </template>
      </WListCard>
    </template>
  </WInfiniteList>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import {computed, ref} from 'vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'
import {getIsMobile} from '@/utils/mobile'
import {getPosition, useSelected} from '@/utils/useSelected'
import WListCard from './WListCard.vue'
import type {BulkComponent, ListField, MenuComponent} from './types'
import WListHeader from './WListHeader.vue'
import WListHeaderItem from './WListHeaderItem.vue'
import {parseOrdering, type OrderItem} from '@/utils/order'
import WButtonSelection from '@/components/Button/WButtonSelection.vue'

const PAGE_LENGTH = 24

const isMobile = getIsMobile()

const props = defineProps<{
  count?: number
  fields: ListField<Data, QueryParams>[]
  useQueryFn: UseQueryPaginated<Data, QueryParams>
  queryParams: QueryParams
  bulkDisableMessage?: string
  selectionTitle: string
  bulk?: BulkComponent<QueryParams>[]
  menu: MenuComponent<Data>[]
  readonlyGetter?: (item: Data) => boolean
  cardClass?: string
  isInvalidPage: (error: unknown) => boolean
  selectAllTextGetter: (isUnselect: boolean, count: number) => string
}>()

defineEmits<{
  (e: 'update:header-padding', value: number): void
}>()

const listCount = ref(0)
const selectionCount = ref(0)

const allowSelect = computed(() => props.bulk !== undefined)

const {
  selected,
  reverse,
  setSelected,
  setSelectedReverse,
  selectedRange,
  setSelectedRange,
} = useSelected()

const ordering = computed<OrderItem<keyof Data>[]>(() => {
  if (props.queryParams instanceof Object && 'ordering' in props.queryParams && typeof props.queryParams.ordering === 'string') {
    return parseOrdering(props.queryParams.ordering)
  }

  return []
})

const getQueryParamsBulk =  (): QueryParams => {
  if (selectedRange.value) {
    return {
      ...props.queryParams,
      slice_indexes: [
        getPosition(selectedRange.value[0], PAGE_LENGTH),
        getPosition(selectedRange.value[1], PAGE_LENGTH),
      ],
      page: undefined,
    }
  }

  if (selected.value.length) {
    if (reverse.value) {
      return {
        ...props.queryParams,
        id__not_in: selected.value.slice(),
      }
    } else {
      return {
        ...props.queryParams,
        id__in: selected.value.slice(),
      }
    }
  }

  return props.queryParams
}

</script>
