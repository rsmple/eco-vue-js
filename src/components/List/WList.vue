<template>
  <div
    :class="{
      'w-card': isGrid,
      'w-list': !isGrid,
    }"
  >
    <WInfiniteList
      :use-query-fn="useQueryFn"
      :query-params="queryParams"
      :query-options="queryOptions"
      :skeleton-length="count ?? listCount ?? PAGE_LENGTH"
      hide-page-title

      :page-length="PAGE_LENGTH"
      :count="count ?? listCount"
      :page-class="
        isGrid
          ? 'grid grid-cols-[repeat(auto-fill,minmax(var(--w-list-card-width,16rem),1fr))] gap-[--w-list-gap,0]'
          : 'grid grid-cols-1 gap-[--w-list-gap,0]'
      "
      :style="cardStyles"
      :class="$attrs.class"

      @update:count="listCount = $event"
      @update:error="$emit('update:error', $event)"
    >
      <template #header="{updateHeaderHeight, isRefetchingAll, refetchAll}">
        <slot
          name="header"
          :count="listCount"
        />

        <WButtonSelection
          :title="selectionTitle"
          :disable-message="bulkDisableMessage"
          :selected-count="selectionCount"
          :style="{zIndex: BASE_ZINDEX_DROPDOWN}"
          @clear:selection="resetSelection"
        >
          <template
            v-if="bulk || action"
            #default="{disableMessage, cssClass}"
          >
            <template v-if="selectionCount === 0 && action">
              <template
                v-for="(item, index) in action"
                :key="index"
              >
                <component
                  :is="item"
                  :query-params="queryParams"
                  :readonly="readonly ?? false"
                  :class="cssClass"
                />
              </template>
            </template>

            <template v-else>
              <template
                v-for="(item, index) in bulk"
                :key="index"
              >
                <component
                  :is="item"
                  :selection-count="selectionCount"
                  :query-params-getter="getQueryParamsBulk"
                  :disable-message="disableMessage"
                  :readonly="readonly ?? false"
                  :class="cssClass"
                  @clear:selected="resetSelection"
                />
              </template>
            </template>
          </template>

          <template
            v-if="bulk && bulkMore"
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
                :readonly="readonly ?? false"
                :class="scope?.cssClass"
                @clear:selected="resetSelection"
              />
            </template>
          </template>

          <template #settings>
            <slot
              v-if="$slots.selection"
              name="selection"
            />

            <div
              v-else
              class="flex"
            >
              <WButtonSelectionAction
                v-if="!noRefetch"
                :icon="markRaw(IconRefresh)"
                :loading="isRefetchingAll"
                class="last-not:border-r border-solid border-gray-300 dark:border-gray-700"
                @click="refetchAll"
              />

              <HeaderSort
                v-if="!noOrdering"
                :ordering="ordering"
                :fields="fieldsFiltered"
                :query-params="queryParams"
                class="last-not:border-r border-solid border-gray-300 dark:border-gray-700"
                @update:ordering="updateOrdering"
              />

              <HeaderSettings
                v-if="!noHeaderSettings"
                v-model:field-config-map="fieldConfigMap"
                :mode="listConfig.mode"
                :fields="fieldsVisible"
                :query-params="queryParams"
                :has-saved="hasSaved"
                :mobile="isMobile"
                @click:reset="reset"
                @update:mode="updateMode"
              />
            </div>
          </template>
        </WButtonSelection>

        <WListHeader
          v-if="!isGrid"
          class="sm-not:hidden"
          :allow-select="allowSelect"
          :tooltip-text="selectAllTextGetter(selectAllValue !== true, count ?? listCount ?? 0)"
          :hide-more="!menu"

          :count="count ?? listCount"
          :selection="selectAllValue"
          @toggle:selection="$event ? selectAll() : resetSelection()"
          @update:header="updateHeaderHeight"
        >
          <template #default>
            <HeaderFieldNested :fields="fieldsFiltered">
              <template #default="{field, nested}">
                <WListHeaderItem
                  :title="typeof field.meta.title === 'string' ? field.meta.title : field.meta.title(queryParams)"
                  :field="typeof field.meta.field === 'string' ? field.meta.field : (field.meta.field?.(queryParams) as keyof Data)"
                  :class="field.meta.cssClass"
                  :ordering="ordering"
                  :disabled="noOrdering || !field.meta.field"
                  :allow-resize="field.meta.allowResize"
                  :item-class="field.meta.cssClassHeader"
                  :width-style="getFieldStyles(field.meta.label, nested)"
                  @update:width="fieldConfigMap[field.meta.label].width = $event"
                  @save:width="save"
                  @update:ordering="updateOrdering"
                />
              </template>
            </HeaderFieldNested>
          </template>
        </WListHeader>
      </template>

      <template #default="{item, skeleton, setter, refetch, previous, index, position, value}">
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
          :form-name="skeleton ? undefined : formNameGetter?.(item)"
          :card="isGrid"
          :to="skeleton ? undefined : cardTo?.(item)"
          :has-action="hasAction"
          :skeleton="skeleton"

          :selected="skeleton ? false : getIsSelected(value as number, position)"
          :allow-select="allowSelect"
          :allow-select-hover="allowSelectHover"
          @toggle:selected="toggleSelected(value as number, position)"
          @hover:selected="hoverSelected(position)"
          @click:action="$emit('click:action', {item, setter})"
        >
          <template #default="{validate}">
            <ListCardFieldNested
              :fields="fieldsFiltered"
              :item="item"
              :skeleton="skeleton"
              :card="isGrid"
              :readonly="readonly || (readonlyGetter?.(item) ?? false)"
            >
              <template #default="defaultScope">
                <component
                  :is="defaultScope.field.default"
                  :item="defaultScope.item"
                  :readonly="readonly || (readonlyGetter?.(defaultScope.item) ?? false)"
                  :skeleton="skeleton"
                  :card="isGrid"
                  :class="{
                    [defaultScope.field.meta.cssClass ?? '']: true,
                    'items-center': !alignTop,
                    'items-start': alignTop,
                    'pr-6': !isGrid,
                  }"
                  :style="getFieldStyles(defaultScope.field.meta.label, defaultScope.nested)"
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

          <template
            v-if="menu"
            #more
          >
            <template
              v-for="(menuItem, menuIndex) in menu"
              :key="menuIndex"
            >
              <component
                :is="Array.isArray(menuItem) ? menuItem[0] : menuItem"
                v-bind="Array.isArray(menuItem) ? menuItem[1] : undefined"
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

      <template
        v-if="$slots.empty"
        #empty
      >
        <slot name="empty" />
      </template>
    </WInfiniteList>
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams, Fields extends ListFields<Data, QueryParams>, CardColumns extends readonly GridCol[]">
import type {ActionComponent, BulkComponent, CardActionParams, CardAreas, FieldComponent, FieldConfigMap, GridCol, ListFields, MenuComponent} from './types'
import type {LinkProps} from '@/types/types'
import type {ApiError} from '@/utils/api'

import {type StyleValue, computed, markRaw, ref, toRef, watch} from 'vue'

import WButtonSelection from '@/components/Button/WButtonSelection.vue'
import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'

import IconRefresh from '@/assets/icons/sax/IconRefresh.svg?component'

import {useIsMobile} from '@/utils/mobile'
import {type OrderItem, encodeOrdering, parseOrdering} from '@/utils/order'
import {PAGE_LENGTH} from '@/utils/useDefaultQuery'
import {useSelected} from '@/utils/useSelected'
import {BASE_ZINDEX_DROPDOWN, ListMode} from '@/utils/utils'

import WListCard from './WListCard.vue'
import WListHeader from './WListHeader.vue'
import WListHeaderItem from './WListHeaderItem.vue'
import HeaderFieldNested from './components/HeaderFieldNested.vue'
import HeaderSettings from './components/HeaderSettings.vue'
import HeaderSort from './components/HeaderSort.vue'
import ListCardFieldNested from './components/ListCardFieldNested.vue'
import {filterFields, getFirstFieldLabel, useListConfig} from './use/useListConfig'

defineOptions({inheritAttrs: false})

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
  action?: ActionComponent<QueryParams>[]
  menu?: MenuComponent<Data>[]
  readonlyGetter?: (item: Data) => boolean
  cardClass?: string
  cardWrapperClass?: string
  selectAllTextGetter: (isUnselect: boolean, count: number) => string
  hasBorder?: boolean
  configKey: string
  defaultConfigMap: FieldConfigMap<Fields>
  defaultMode?: ListMode
  alignTop?: boolean
  disableMore?: boolean
  readonly?: boolean
  noOrdering?: boolean
  formNameGetter?: (data: Data) => string | undefined
  groupBy?: (a: Data, b: Data) => boolean
  cardColumns: CardColumns
  cardAreas: CardAreas<Fields, CardColumns['length']>
  cardTo?: (item: Data) => LinkProps['to'] | undefined
  hasAction?: boolean
  noHeaderSettings?: boolean
  noRefetch?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:error', value: ApiError): void
  (e: 'click:action', value: CardActionParams<Data>): void
  (e: 'update:query-params', value: QueryParams): void
  (e: 'update:count', value: number | undefined): void
}>()

const {isMobile} = useIsMobile()

const listCount = ref<number | undefined>(undefined)

const countValue = computed(() => props.count ?? listCount.value)

const cardStyles = computed<StyleValue>(() => {
  if (!props.cardColumns || !props.cardAreas) return

  return {
    '--w-list-grid-cols': props.cardColumns.join(' '),
    '--w-list-grid-areas': props.cardAreas.map(inner => `"${ inner.join(' ') }"`).join('\n'),
  }
})

const fieldsVisible = computed(() => filterFields(props.fields, field => field.visibleGetter?.(props.queryParams) ?? true))

const {
  listConfig,
  fieldConfigMap,
  isGrid,
  hasSaved,
  reset,
  save,
  updateMode,
} = useListConfig(toRef(props, 'configKey'), fieldsVisible, toRef(props, 'defaultConfigMap'), toRef(props, 'defaultMode'), props.noHeaderSettings)

const fieldsFiltered = computed(() => {
  return filterFields(fieldsVisible.value, field => fieldConfigMap.value[field.label]?.visible)
    .sort((a, b) => fieldConfigMap.value[getFirstFieldLabel(a)].order - fieldConfigMap.value[getFirstFieldLabel(b)].order)
})

const allowSelect = computed(() => props.bulk !== undefined)
const allowOpen = computed(() => props.expansion !== undefined)

const disableSelect = computed(() => !allowSelect.value)

const {
  allowSelectHover,
  selectionCount,
  selectAllValue,
  getIsSelected,
  hoverSelected,
  toggleSelected,
  resetSelection,
  selectAll,
  getQueryParams,
} = useSelected<number>(countValue, disableSelect)

const ordering = computed<OrderItem<keyof Data>[]>(() => {
  if (props.queryParams instanceof Object && 'ordering' in props.queryParams && typeof props.queryParams.ordering === 'string') {
    return parseOrdering(props.queryParams.ordering)
  }

  return []
})

const updateOrdering = (value: OrderItem<keyof Data>[]) => {
  const ordering = encodeOrdering(value)

  if (props.queryParams instanceof Object && 'ordering' in props.queryParams && ordering === props.queryParams.ordering) return

  emit('update:query-params', {ordering} as QueryParams)
}

const getQueryParamsBulk = (): QueryParams => {
  const queryParamsSelection = getQueryParams()

  if (queryParamsSelection) return {
    ...props.queryParams,
    ...queryParamsSelection,
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

watch(countValue, value => emit('update:count', value), {immediate: true})
</script>
