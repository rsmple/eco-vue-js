<template>
  <div
    :class="{
      'w-card': isGrid,
      'w-list': !isGrid,
    }"
  >
    <WInfiniteList
      :use-query-fn="useQueryFn"
      :query-params="(queryParams as QueryParams)"
      :query-options="queryOptions"
      :skeleton-length="count ?? listCount ?? PAGE_LENGTH"
      hide-page-title

      :allow-select="allowSelect"
      allow-select-range
      :selected="selected"
      :reverse="reverse"
      :selected-range="selectedRange"
      :page-length="PAGE_LENGTH"
      :count="count ?? listCount"
      :page-class="
        isGrid
          ? 'grid grid-cols-[repeat(auto-fill,minmax(var(--w-list-card-width,16rem),1fr))] gap-[--w-list-gap,1rem]'
          : 'grid grid-cols-1 gap-[--w-list-gap,1rem]'
      "
      :style="cardStyles"
      :class="$attrs.class"
      @select="setSelected"
      @select-reverse="setSelectedReverse"
      @select-range="setSelectedRange"

      @update:count="listCount = $event"
      @update:error="$emit('update:error', $event)"
    >
      <template #header="{selectAllValue}">
        <slot
          name="header"
          :count="listCount"
        />

        <WButtonSelection
          :title="selectionTitle"
          :disable-message="bulkDisableMessage"
          class="z-[3]"
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

          <template #settings>
            <div class="flex">
              <HeaderSort
                v-if="!noOrdering"
                :ordering="ordering"
                :fields="fieldsFiltered"
                :query-params="queryParams"
                class="border-r border-solid border-gray-300 dark:border-gray-700"
              />

              <HeaderSettings
                v-model:field-config-map="fieldConfigMap"
                :mode="listConfig.mode"
                :fields="fieldsVisible"
                :query-params="queryParams"
                :has-saved="hasSaved"
                @click:reset="reset"
                @update:mode="updateMode"
              />
            </div>
          </template>
        </WButtonSelection>

        <WListHeader
          v-if="!isGrid"
          class="sm-not:hidden mb-4"
          :query-params="queryParams"
          :allow-select="allowSelect"
          :tooltip-text="selectAllTextGetter(selectAllValue !== true, count ?? listCount ?? 0)"

          :count="count ?? listCount"
          :selection="selectAllValue"
          @toggle:selection="$event ? setSelectedReverse([]) : setSelected([])"
        >
          <template #default>
            <HeaderFieldNested :fields="fieldsFiltered">
              <template #default="{field, nested}">
                <WListHeaderItem
                  :title="typeof field.title === 'string' ? field.title : field.title(queryParams)"
                  :field="typeof field.field === 'string' ? field.field : field.field?.(queryParams)"
                  :class="field.cssClass"
                  :ordering="ordering"
                  :disabled="noOrdering || !field.field"
                  :allow-resize="field.allowResize"
                  :item-class="field.cssClassHeader"
                  :width-style="getFieldStyles(field.label, nested)"
                  @update:width="fieldConfigMap[field.label].width = $event"
                  @save:width="save"
                />
              </template>
            </HeaderFieldNested>
          </template>
        </WListHeader>
      </template>

      <template #default="{item, skeleton, setter, refetch, previous, index}">
        <slot
          v-if="groupBy && (index === 0 || (!skeleton && (!previous || !groupBy(item, previous))))"
          name="group"
          :item="item"
          :previous="previous"
          :skeleton="skeleton"
        />

        <WListCard
          :disabled="skeleton"
          :disable-more="disableMore"
          :mobile="isMobile"
          :card-class="cardClass"
          :card-wrapper-class="cardWrapperClass"
          :has-border="hasBorder"
          :allow-open="allowOpen && !skeleton"
          :align-top="alignTop"
          :hide-more="hideMore"
          :form-name="!skeleton ? formNameGetter?.(item) : undefined"
          :card="isGrid"
          :to="cardTo?.(item)"
        >
          <template #default="{validate}">
            <ListCardFieldNested
              :fields="fieldsFiltered"
              :item="item"
              :skeleton="skeleton"
              :card="isGrid"
            >
              <template #default="defaultScope">
                <component
                  :is="defaultScope.field.component"
                  :item="defaultScope.item"
                  :readonly="readonly || (readonlyGetter?.(defaultScope.item) ?? false)"
                  :skeleton="skeleton"
                  :card="isGrid"
                  :class="{
                    [defaultScope.field.cssClass ?? '']: true,
                    'items-center': !alignTop,
                    'items-start': alignTop,
                    'pr-6': !isGrid,
                  }"
                  :style="getFieldStyles(defaultScope.field.label, defaultScope.nested)"
                  @update:item="setter"
                  @delete:item="setter(); refetch()"
                  @validate="validate()"
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
              :card="isGrid"
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
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams, Fields extends ListFields<Data, QueryParams>, CardColumns extends readonly GridCol[]">
import type {BulkComponent, CardAreas, FieldComponent, FieldConfigMap, GridCol, ListFields, MenuComponent} from './types'
import type {LinkProps} from '@/types/types'
import type {ApiError} from '@/utils/api'

import {type StyleValue, computed, ref, toRef} from 'vue'

import WButtonSelection from '@/components/Button/WButtonSelection.vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'

import {getIsMobile} from '@/main'
import {type OrderItem, parseOrdering} from '@/utils/order'
import {PAGE_LENGTH} from '@/utils/useDefaultQuery'
import {getPosition, useSelected} from '@/utils/useSelected'

import WListCard from './WListCard.vue'
import WListHeader from './WListHeader.vue'
import WListHeaderItem from './WListHeaderItem.vue'
import HeaderFieldNested from './components/HeaderFieldNested.vue'
import HeaderSettings from './components/HeaderSettings.vue'
import HeaderSort from './components/HeaderSort.vue'
import ListCardFieldNested from './components/ListCardFieldNested.vue'
import {filterFields, getFirstFieldLabel, useListConfig} from './use/useListConfig'

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
  configKey: string
  defaultConfigMap: FieldConfigMap<Fields>
  alignTop?: boolean
  disableMore?: boolean
  readonly?: boolean
  noOrdering?: boolean
  formNameGetter?: (data: Data) => string | undefined
  groupBy?: (a: Data, b: Data) => boolean
  hideMore?: boolean
  cardColumns: CardColumns
  cardAreas: CardAreas<Fields, CardColumns['length']>
  cardTo?: (item: Data) => LinkProps['to']
}>()

defineEmits<{
  (e: 'update:error', value: ApiError): void
}>()

const listCount = ref<number | undefined>(undefined)
const selectionCount = ref(0)

const cardStyles = computed<StyleValue>(() => {
  if (!props.cardColumns || !props.cardAreas) return

  return {
    '--w-list-grid-cols': props.cardColumns.join(' '),
    '--w-list-grid-areas': props.cardAreas.map(inner => `"${ inner.join(' ') }"`).join('\n'),
  }
})

const fieldsVisible = computed(() => filterFields(props.fields, field => field.visibleGetter?.(props.queryParams) ?? true))

const {listConfig, fieldConfigMap, isGrid, hasSaved, reset, save, updateMode} = useListConfig(toRef(props, 'configKey'), fieldsVisible, toRef(props, 'defaultConfigMap'))

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

const getFieldStyles = (label: string, nested: boolean): StyleValue | undefined => {
  if (isGrid.value) return nested ? undefined : {gridArea: label}

  if (!fieldConfigMap.value[label]?.width) return undefined

  const value = fieldConfigMap.value[label].width + 'px'

  return {
    minWidth: value,
    maxWidth: value,
  }
}
</script>
