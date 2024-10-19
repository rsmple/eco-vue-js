<template>
  <WInfiniteList
    :use-query-fn="useQueryFn"
    :query-params="(queryParams as QueryParams)"
    :skeleton-length="count ?? listCount"
    :header-margin="isMobile ? 0 : 24"
    hide-page-title

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

        <template
          v-if="bulkMore"
          #more="scope"
        >
          <template
            v-for="(item, index) in bulkMore"
            :key="index"
          >
            <component
              :is="item"
              :selection-count="selectionCount"
              :query-params-getter="getQueryParamsBulk"
              :disable-message="scope?.disableMessage"
              :class="scope?.cssClass"
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
        <template
          v-for="(field, index) in fields"
          :key="index"
        >
          <template v-if="field.visibleGetter?.(queryParams) ?? true">
            <WListHeaderItem
              :title="typeof field.title === 'string' ? field.title : field.title(queryParams)"
              :field="typeof field.field === 'string' ? field.field : field.field?.(queryParams)"
              :class="[field.cssClass, index === fields.length - 1 ? 'z-[1]' : undefined]"
              :ordering="ordering"
              :disabled="!field.field"
              :allow-resize="field.allowResize"
              :style="{
                minWidth: !isMobile && fieldConfig[index]?.width ? fieldConfig[index].width + 'px' : undefined
              }"
              @update:width="fieldConfig[index].width = $event"
            />
          </template>
        </template>
      </WListHeader>
    </template>

    <template #default="{item, skeleton, setter, refetch}">
      <WListCard
        :disabled="skeleton"
        :mobile="isMobile"
        :card-class="cardClass"
        :has-border="hasBorder"
        :more-bottom="moreBottom"
        :allow-open="fields.some(item => item.allowOpen) && !skeleton"
      >
        <template #default="{toggle, isOpen}">
          <template
            v-for="(field, index) in fields"
            :key="index"
          >
            <template v-if="field.visibleGetter?.(queryParams) ?? true">
              <component
                :is="field.component"
                :item="item"
                :readonly="readonlyGetter?.(item)"
                :skeleton="skeleton"
                :mobile="isMobile"
                :class="{
                  [field.cssClass ?? '']: true,
                  'cursor-pointer w-ripple w-ripple-hover w-ripple-has w-ripple-opacity-[0.04]': field.allowOpen && !skeleton,
                  'sm:border-y border-gray-300 dark:border-gray-700': hasBorder,
                  'sm:border-b-[transparent] sm:dark:border-b-[transparent]': hasBorder && isOpen,
                }"
                :style="{
                  minWidth: !isMobile && fieldConfig[index]?.width ? fieldConfig[index].width + 'px' : undefined
                }"
                @update:item="setter"
                @delete:item="setter(); refetch()"
                @click="field.allowOpen && !skeleton && toggle()"
              />
            </template>
          </template>
        </template>

        <template
          v-if="expansion"
          #expansion
        >
          <component
            :is="expansion"
            :item="item"
            :readonly="readonlyGetter?.(item)"
            :skeleton="skeleton"
            :mobile="isMobile"
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
import type {BulkComponent, FieldComponent, ListField, MenuComponent} from './types'
import WListHeader from './WListHeader.vue'
import WListHeaderItem from './WListHeaderItem.vue'
import {parseOrdering, type OrderItem} from '@/utils/order'
import WButtonSelection from '@/components/Button/WButtonSelection.vue'

type FieldConfig = {
  width: number
}

const PAGE_LENGTH = 24

const isMobile = getIsMobile()

const props = defineProps<{
  count?: number
  fields: ListField<Data, QueryParams>[]
  expansion?: FieldComponent<Data>
  useQueryFn: UseQueryPaginated<Data, QueryParams>
  queryParams: QueryParams
  bulkDisableMessage?: string
  selectionTitle: string
  bulk?: BulkComponent<QueryParams>[]
  bulkMore?: BulkComponent<QueryParams>[]
  menu: MenuComponent<Data>[]
  readonlyGetter?: (item: Data) => boolean
  cardClass?: string
  selectAllTextGetter: (isUnselect: boolean, count: number) => string
  hasBorder?: boolean
  moreBottom?: boolean
}>()

defineEmits<{
  (e: 'update:header-padding', value: number): void
}>()

const listCount = ref(0)
const selectionCount = ref(0)

const fieldConfig = ref<FieldConfig[]>(props.fields.map(() => ({width: 0})))

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
