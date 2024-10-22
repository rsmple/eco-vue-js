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
          v-for="field in fieldsFiltered"
          :key="field.label"
        >
          <WListHeaderItem
            :title="typeof field.title === 'string' ? field.title : field.title(queryParams)"
            :field="typeof field.field === 'string' ? field.field : field.field?.(queryParams)"
            :class="field.cssClass"
            :ordering="ordering"
            :disabled="!field.field"
            :allow-resize="field.allowResize"
            :style="{
              minWidth: !isMobile && fieldsConfig[field.label]?.width ? fieldsConfig[field.label].width + 'px' : undefined,
            }"
            @update:width="fieldsConfig[field.label].width = $event"
          />
        </template>

        <template #settings>
          <HeaderSettings
            :fields="fields"
            :fields-config="fieldsConfig"
            :query-params="queryParams"
            @update:fields-config="fieldsConfig = {...fieldsConfig, ...$event}"
          />
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
        :allow-open="allowOpen && !skeleton"
      >
        <template
          v-for="field in fieldsFiltered"
          :key="field.label"
        >
          <component
            :is="field.component"
            :item="item"
            :readonly="readonlyGetter?.(item)"
            :skeleton="skeleton"
            :mobile="isMobile"
            :class="field.cssClass"
            :style="{
              minWidth: !isMobile && fieldsConfig[field.label]?.width ? fieldsConfig[field.label].width + 'px' : undefined,
            }"
            @update:item="setter"
            @delete:item="setter(); refetch()"
          />
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
import type {BulkComponent, FieldComponent, FieldConfig, ListField, MenuComponent} from './types'
import WListHeader from './WListHeader.vue'
import WListHeaderItem from './WListHeaderItem.vue'
import {parseOrdering, type OrderItem} from '@/utils/order'
import WButtonSelection from '@/components/Button/WButtonSelection.vue'
import HeaderSettings from './components/HeaderSettings.vue'

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

const fieldsConfig = ref<Record<string, FieldConfig>>(props.fields.reduce<Record<string, FieldConfig>>((result, field, index) => {
  result[field.label] = {
    width: 0,
    visible: true,
    order: index,
  }

  return result
}, {}))

const fieldsVisible = computed(() => props.fields.filter(field => field.visibleGetter?.(props.queryParams) ?? true))

const fieldsFiltered = computed(() => {
  if (isMobile) return fieldsVisible.value

  return fieldsVisible.value
    .filter(field => fieldsConfig.value[field.label].visible)
    .sort((a, b) => fieldsConfig.value[a.label].order - fieldsConfig.value[b.label].order)
})

const allowSelect = computed(() => props.bulk !== undefined)
const allowOpen = computed(() => props.expansion !== undefined)

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
