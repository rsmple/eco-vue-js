<template>
  <WInfiniteList
    :use-query-fn="useQueryFn"
    :query-params="(queryParams as QueryParams)"
    :query-options="queryOptions"
    :skeleton-length="count ?? listCount ?? PAGE_LENGTH"
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
      <slot
        name="header"
        :count="listCount"
      />

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
        :tooltip-text="selectAllTextGetter(selectAllValue !== true, count ?? listCount ?? 0)"

        :count="count ?? listCount"
        :selection="selectAllValue"
        @toggle:selection="$event ? setSelectedReverse([]) : setSelected([])"
      >
        <template #default>
          <HeaderFieldNested :fields="fieldsFiltered">
            <template #default="{field}">
              <WListHeaderItem
                :title="typeof field.title === 'string' ? field.title : field.title(queryParams)"
                :field="typeof field.field === 'string' ? field.field : field.field?.(queryParams)"
                :class="field.cssClass"
                :ordering="ordering"
                :disabled="!field.field"
                :allow-resize="field.allowResize"
                :item-class="field.cssClassHeader"
                :width-style="getFieldStyles(field.label)"
                @update:width="fieldConfigMap[field.label].width = $event"
                @save:width="fieldConfigMap = fieldConfigMap"
              />
            </template>
          </HeaderFieldNested>
        </template>

        <template #settings>
          <HeaderSettings
            v-model:field-config-map="fieldConfigMap"
            :fields="fieldsVisible"
            :query-params="queryParams"
            :has-saved="hasSaved"
            @click:reset="reset"
          />
        </template>
      </WListHeader>
    </template>

    <template #default="{item, skeleton, setter, refetch}">
      <WListCard
        :disabled="skeleton"
        :disable-more="disableMore"
        :mobile="isMobile"
        :card-class="cardClass"
        :card-wrapper-class="cardWrapperClass"
        :has-border="hasBorder"
        :more-bottom="moreBottom"
        :allow-open="allowOpen && !skeleton"
        :align-top="alignTop"
      >
        <template #default>
          <ListCardFieldNested
            :fields="fieldsFiltered"
            :item="item"
            :skeleton="skeleton"
            :mobile="isMobile"
          >
            <template #default="defaultScope">
              <component
                :is="defaultScope.field.component"
                :item="defaultScope.item"
                :readonly="readonly || (readonlyGetter?.(defaultScope.item) ?? false)"
                :skeleton="skeleton"
                :mobile="isMobile"
                :class="{
                  [defaultScope.field.cssClass ?? '']: true,
                  'items-center': !alignTop,
                  'items-start': alignTop,
                }"
                :style="getFieldStyles(defaultScope.field.label)"
                @update:item="setter"
                @delete:item="setter(); refetch()"
              />
            </template>
          </ListCardFieldNested>
        </template>

        <template
          v-if="expansion"
          #expansion
        >
          <component
            :is="expansion"
            :item="item"
            :readonly="readonly || (readonlyGetter?.(item) ?? false)"
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
              :readonly="readonly || (readonlyGetter?.(item) ?? false)"
              :update-item="setter"
              :delete-item="() => {
                setter()
                refetch()
              }"
              @update:item="setter"
              @delete:item="setter(); refetch()"
            />
          </template>
        </template>
      </WListCard>
    </template>
  </WInfiniteList>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams, Fields extends ListFields<Data, QueryParams>">
import {computed, ref, toRef, type StyleValue} from 'vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'
import {getIsMobile} from '@/utils/mobile'
import {getPosition, useSelected} from '@/utils/useSelected'
import WListCard from './WListCard.vue'
import type {BulkComponent, FieldComponent, FieldConfigMap, ListFields, MenuComponent} from './types'
import WListHeader from './WListHeader.vue'
import WListHeaderItem from './WListHeaderItem.vue'
import {parseOrdering, type OrderItem} from '@/utils/order'
import WButtonSelection from '@/components/Button/WButtonSelection.vue'
import HeaderSettings from './components/HeaderSettings.vue'
import {filterFields, getFirstFieldLabel, useFieldConfigMap} from './use/useFieldConfigMap'
import ListCardFieldNested from './components/ListCardFieldNested.vue'
import HeaderFieldNested from './components/HeaderFieldNested.vue'
import {PAGE_LENGTH} from '@/utils/useDefaultQuery'

const isMobile = getIsMobile()

const props = defineProps<{
  count?: number
  fields: Fields
  expansion?: FieldComponent<Data>
  useQueryFn: UseQueryPaginated<Data, QueryParams>
  queryParams: QueryParams
  queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>
  bulkDisableMessage?: string
  selectionTitle: string
  bulk?: BulkComponent<QueryParams>[]
  bulkMore?: BulkComponent<QueryParams>[]
  menu: MenuComponent<Data>[]
  readonlyGetter?: (item: Data) => boolean
  cardClass?: string
  cardWrapperClass?: string
  selectAllTextGetter: (isUnselect: boolean, count: number) => string
  hasBorder?: boolean
  moreBottom?: boolean
  configKey: string
  defaultConfigMap: FieldConfigMap<Fields>
  alignTop?: boolean
  disableMore?: boolean
  readonly?: boolean
}>()

defineEmits<{
  (e: 'update:header-padding', value: number): void
}>()

const listCount = ref<number | undefined>(undefined)
const selectionCount = ref(0)

const fieldsVisible = computed(() => filterFields(props.fields, field => field.visibleGetter?.(props.queryParams) ?? true))

const {fieldConfigMap, hasSaved, reset} = useFieldConfigMap(toRef(props, 'configKey'), fieldsVisible, toRef(props, 'defaultConfigMap'))

const fieldsFiltered = computed(() => {
  return filterFields(fieldsVisible.value, field => fieldConfigMap.value[field.label]?.visible)
    .sort((a, b) => fieldConfigMap.value[getFirstFieldLabel(a)].order - fieldConfigMap.value[getFirstFieldLabel(b)].order)
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

const getFieldStyles = (label: string): StyleValue | undefined => {
  if (isMobile || !fieldConfigMap.value[label]?.width) return undefined

  const value = fieldConfigMap.value[label].width + 'px'

  return {
    minWidth: value,
    maxWidth: value,
  }
}

</script>
