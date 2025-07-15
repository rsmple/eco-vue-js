<template>
  <div
    :class="{
      'w-card': isGrid,
      'w-list': !isGrid,
      '[--w-list-right:calc(var(--w-list-padding,1rem)*2+1.25em+1px)]': menu,
      '[--w-list-right:calc(var(--w-list-header-rounded,1rem)+1px)]': !menu,
      '[--w-list-left:calc(var(--w-list-padding,1rem)*2+1.25em+2px)]': allowSelect,
      '[--w-list-left:calc(var(--w-list-header-rounded,1rem)+1px)': !allowSelect,
    }"
    :style="[stylesWidth, stylesFixed]"
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
                  :readonly="isReadonly ?? isDisabled ?? false"
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
                  :readonly="isReadonly ?? isDisabled ?? false"
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
                :readonly="isReadonly ?? isDisabled ?? false"
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
                @click:reset="reset(); updateStylesWidth(); updateStylesFixed()"
                @update:mode="updateMode"
                @update:field-config-map="updateStylesWidth(); updateStylesFixed()"
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
            <HeaderFieldNested
              :fields="fieldsFiltered"
              :field-config-map="fieldConfigMap"
            >
              <template #default="{field}">
                <WListHeaderItem
                  :title="typeof field.meta.title === 'string' ? field.meta.title : field.meta.title(queryParams)"
                  :field="typeof field.meta.field === 'string' ? field.meta.field : (field.meta.field?.(queryParams) as keyof Data)"
                  :ordering="ordering"
                  :disabled="noOrdering || !field.meta.field"
                  :allow-resize="field.meta.allowResize"
                  :item-class="field.meta.cssClassHeader"
                  :style-value="isGrid ? {gridArea: field.meta.label} : {
                    minWidth: field.meta.allowResize ? `var(${getFieldVariable('width', field.meta.label)})` : undefined,
                    maxWidth: field.meta.allowResize ? `var(${getFieldVariable('width', field.meta.label)})` : undefined,
                    left: fieldConfigMap[field.meta.label]?.sticky ? `var(${getFieldVariable('left', field.meta.label)})` : undefined,
                    right: fieldConfigMap[field.meta.label]?.sticky ? `var(${getFieldVariable('right', field.meta.label)})` : undefined,
                  }"
                  :has-width="stylesWidth[getFieldVariable('width', field.meta.label)] !== undefined"
                  :class="{
                    [field.meta.cssClass ?? '']: true,
                    'sticky z-[1] bg-[inherit]': !isGrid && fieldConfigMap[field.meta.label]?.sticky,
                  }"
                  @update:width="fieldConfigMap[field.meta.label].width = $event; updateStylesWidth()"
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
          <template #default="{validate, beforeClass}">
            <ListCardFieldNested
              :fields="fieldsFiltered"
              :field-config-map="fieldConfigMap"
              :item="item"
              :skeleton="skeleton"
              :card="isGrid"
              :readonly="(isReadonly ?? isDisabled) || (readonlyGetter?.(item) ?? false)"
            >
              <template #default="defaultScope">
                <component
                  :is="defaultScope.field.default"
                  :item="defaultScope.item"
                  :readonly="(isReadonly ?? isDisabled) || (readonlyGetter?.(defaultScope.item) ?? false)"
                  :skeleton="skeleton"
                  :card="isGrid"
                  :config="fieldConfigMap[defaultScope.field.meta.label]"
                  :class="{
                    [defaultScope.field.meta.cssClass ?? '']: true,
                    'items-center': !alignTop,
                    'items-start': alignTop,
                    'bg-default dark:bg-default-dark sticky z-[1]': !isGrid && fieldConfigMap[defaultScope.field.meta.label]?.sticky,
                    ...(!isGrid && fieldConfigMap[defaultScope.field.meta.label]?.sticky ? beforeClass : {})
                  }"
                  :style="isGrid ? !defaultScope.nested ? {gridArea: defaultScope.field.meta.label} : undefined : {
                    minWidth: `var(${getFieldVariable('width', defaultScope.field.meta.label)})`,
                    maxWidth: `var(${getFieldVariable('width', defaultScope.field.meta.label)})`,
                    left: fieldConfigMap[defaultScope.field.meta.label]?.sticky ? `var(${getFieldVariable('left', defaultScope.field.meta.label)})` : undefined,
                    right: fieldConfigMap[defaultScope.field.meta.label]?.sticky ? `var(${getFieldVariable('right', defaultScope.field.meta.label)})` : undefined,
                  }"
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
              :readonly="(isReadonly ?? isDisabled) || (readonlyGetter?.(item) ?? false)"
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
                :readonly="(isReadonly ?? isDisabled) || (readonlyGetter?.(item) ?? false)"
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
import type {ActionComponent, BulkComponent, CardActionParams, CardAreas, ExpansionComponent, FieldConfigMap, GridCol, ListFields, MenuComponent} from './types'
import type {LinkProps} from '@/types/types'
import type {ApiError} from '@/utils/api'

import {type StyleValue, computed, markRaw, nextTick, ref, toRef, watch} from 'vue'

import WButtonSelection from '@/components/Button/WButtonSelection.vue'
import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'

import IconRefresh from '@/assets/icons/sax/IconRefresh.svg?component'

import {useIsMobile} from '@/utils/mobile'
import {type OrderItem, encodeOrdering, parseOrdering} from '@/utils/order'
import {useComponentStates} from '@/utils/useComponentStates'
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
import {filterFields, getFieldStylesFixed, getFieldStylesWidth, getFieldVariable, sortFields, useListConfig} from './use/useListConfig'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<{
    count?: number
    fields: Fields
    expansion?: ExpansionComponent<Data>
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
  }>(),
  {
    count: undefined,
    expansion: undefined,
    queryOptions: undefined,
    bulkDisableMessage: undefined,
    bulk: undefined,
    bulkMore: undefined,
    action: undefined,
    menu: undefined,
    readonlyGetter: undefined,
    readonly: undefined,
    cardClass: undefined,
    cardWrapperClass: undefined,
    defaultMode: ListMode.TABLE,
    formNameGetter: undefined,
    groupBy: undefined,
    cardTo: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:error', value: ApiError): void
  (e: 'click:action', value: CardActionParams<Data>): void
  (e: 'update:query-params', value: QueryParams): void
  (e: 'update:count', value: number | undefined): void
}>()

const {isDisabled, isReadonly} = useComponentStates(props)

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
    return parseOrdering(props.queryParams.ordering) as OrderItem<keyof Data>[]
  }

  return []
})

const stylesWidth = ref<Record<string, string>>({})

const stylesFixed = ref<Record<string, string>>({})

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

const updateStylesWidth = async () => {
  await nextTick()

  stylesWidth.value = getFieldStylesWidth(fieldsFiltered.value, fieldConfigMap.value)
}

const updateStylesFixed = async () => {
  await nextTick()

  stylesFixed.value = getFieldStylesFixed(sortFields(fieldsFiltered.value, fieldConfigMap.value), fieldConfigMap.value)
}

const unwatch = watch(fieldsFiltered, async () => {
  await Promise.all([
    updateStylesWidth(),
    updateStylesFixed(),
  ])

  if (Object.keys(stylesWidth.value).length !== 0 || Object.keys(stylesFixed.value).length !== 0) unwatch.stop()
}, {immediate: true})

watch(countValue, value => emit('update:count', value), {immediate: true})
</script>
