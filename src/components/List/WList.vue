<template>
  <div
    :class="{
      'w-card': isGrid,
      'w-list': !isGrid,
      '[--w-list-right:calc(var(--w-list-padding,1rem)*2+1.25em)]': hasMenu,
      '[--w-list-right:var(--w-list-header-rounded,1rem)]': !hasMenu,
      '[--w-list-left:calc(var(--w-list-padding,1rem)*2+1.25em+1px)]': allowSelect,
      '[--w-list-left:var(--w-list-header-rounded,1rem)]': !allowSelect,
    }"
    :style="[stylesWidth, stylesFixed]"
  >
    <WInfiniteList
      :use-query-fn="useQueryFn"
      :query-params="queryParams"
      :query-options="queryOptions"
      :skeleton-length="count ?? listCount ?? PAGE_LENGTH"
      :refetch-interval="refetchInterval"

      :page-length="PAGE_LENGTH"
      :count="count ?? listCount"
      :page-class="
        isGrid
          ? 'grid grid-cols-[repeat(auto-fill,minmax(var(--w-list-card-width,16rem),1fr))] gap-(--w-list-gap,0) isolate'
          : 'grid grid-cols-1 gap-(--w-list-gap,0) isolate'
      "
      :min-height-only="minHeight"
      :no-header-update="noHeaderUpdate"
      :style="cardStyles"
      :class="$attrs.class"

      @update:count="listCount = $event"
      @update:error="$emit('update:error', $event)"
    >
      <template #header="{updateHeader, isRefetchingAll, refetchAll}">
        <ListToolbar
          :count="listCount"
          :total-count="countValue"
          :selection-title="selectionTitle"
          :bulk-disable-message="bulkDisableMessage"
          :selection-count="selectionCount"
          :select-all-value="selectAllValue"
          :select-all-text-getter="selectAllTextGetter"
          :is-shift="isShift"
          :allow-select="allowSelect"
          :select-only="selectOnly"
          :readonly="isReadonly ?? isDisabled ?? false"

          :query-params="queryParams"
          :use-query-fn="useQueryFn"
          :use-query-fn-export="useQueryFnExport"
          :api-method-export="apiMethodExport"
          :export-file-name="exportFileName"
          :get-query-params-bulk="getQueryParamsBulk"
          :to-markdown="toMarkdown"

          :bulk="bulk"
          :action="action"
          :menu="menu"

          :fields-visible="fieldsVisible"
          :fields-filtered="fieldsFiltered"
          :fields-sorted="fieldsSorted"
          :field-config-map="fieldConfigMap"
          :styles-width="stylesWidth"
          :ordering="ordering"
          :mode="listConfig.mode"

          :card="isGrid"
          :mobile="isMobile"
          :has-saved="hasSaved"
          :no-refetch="noRefetch"
          :no-ordering="noOrdering"
          :no-header-settings="noHeaderSettings"
          :no-mode="noMode"
          :disable-export="disableExport"

          :is-refetching-all="isRefetchingAll"
          :refetch-all="refetchAll"
          :update-header="updateHeader"

          @reset:selection="resetSelection"
          @toggle:selection="toggleSelectAll"
          @set:is-selecting="setIsSelecting()"
          @update:ordering="updateOrdering"
          @update:mode="updateMode"
          @update:field-config-map="updateFieldConfigMap"
          @update:width="updateFieldWidth"
          @save:width="save"
          @click:reset="resetConfig"
        >
          <template
            v-if="$slots.header"
            #header="scope"
          >
            <slot
              name="header"
              v-bind="scope"
            />
          </template>

          <template
            v-if="$slots.selection"
            #selection
          >
            <slot name="selection" />
          </template>
        </ListToolbar>
      </template>

      <template #default="{item, skeleton, setter, refetch, previous, index, position, value, results, intersecting}">
        <slot
          v-if="groupBy && (index === 0 || (!skeleton && (!previous || !groupBy(item, previous))))"
          name="group"
          :item="item"
          :previous="previous"
          :skeleton="skeleton"
        />

        <ListItem
          :item="item"
          :skeleton="skeleton"
          :setter="setter"
          :refetch="refetch"
          :index="index"
          :position="position"
          :value="(value as number)"
          :results="results"
          :intersecting="intersecting"

          :fields="fieldsSorted"
          :field-config-map="fieldConfigMap"
          :column-data-map="columnDataMap"
          :query-params="queryParams"
          :readonly="isReadonly ?? isDisabled ?? false"
          :readonly-getter="readonlyGetter"
          :form-field-getter="formFieldGetter"
          :uniform-scope="uniformScope"
          :expansion="expansion"
          :menu="menu"
          :to-markdown="toMarkdown"

          :card="isGrid"
          :mobile="isMobile"
          :card-class="cardClass"
          :card-wrapper-class="cardWrapperClass"
          :has-border="hasBorder"
          :align-top="alignTop"
          :allow-open="allowOpen"
          :disable-more="disableMore"
          :action-mode="actionMode"
          :card-to="cardTo"
          :content-visibility="contentVisibility"

          :selected="skeleton ? false : getIsSelected(value as number, position)"
          :allow-select="allowSelect"
          :allow-select-hover="allowSelectHover"
          :always-select="alwaysSelect ?? false"

          @toggle:selected="toggleSelected"
          @hover:selected="hoverSelected"
          @click:action="emitClickAction"
        />
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
import type {ActionComponent, BulkComponent, CardActionParams, CardAreas, ColumnData, ExpansionComponent, FieldConfig, FieldConfigMap, GridCol, ListActionMode, ListFields, MenuComponent} from './types'
import type {UniformScope} from '@/components/Uniform/types'
import type {LinkProps} from '@/types/types'
import type {ApiError} from '@/utils/api'

import {type Ref, type StyleValue, computed, nextTick, ref, toRef, watch} from 'vue'

import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'

import {useIsMobile} from '@/utils/mobile'
import {type OrderItem, encodeOrdering, parseOrdering} from '@/utils/order'
import {useComponentStates} from '@/utils/useComponentStates'
import {PAGE_LENGTH} from '@/utils/useDefaultQuery'
import {type Selection, useSelected, useSelectionHash} from '@/utils/useSelected'
import {ListMode} from '@/utils/utils'

import ListItem from './components/ListItem.vue'
import ListToolbar from './components/ListToolbar.vue'
import {filterFields, forEachField, getFieldStylesFixed, getFieldStylesWidth, getFieldVariable, sortFields, sortFieldsDeep, useListConfig} from './use/useListConfig'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<{
    count?: number
    fields: Fields
    expansion?: ExpansionComponent<Data, QueryParams>
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    useQueryFnExport?: UseQueryPaginated<Data, QueryParams>
    queryParams: QueryParams
    queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>
    bulkDisableMessage?: string
    selectionTitle: string
    bulk?: BulkComponent<QueryParams>[]
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
    formFieldGetter?: (data: Data, index: number) => string | undefined
    uniformScope?: UniformScope<Data[]>
    groupBy?: (a: Data, b: Data) => boolean
    cardColumns: CardColumns
    cardAreas: CardAreas<Fields, CardColumns['length']>
    cardTo?: (item: Data) => LinkProps['to'] | undefined
    hasAction?: boolean
    noHeaderSettings?: boolean
    noRefetch?: boolean
    refetchInterval?: number
    apiMethodExport?: (queryParams: QueryParams) => Promise<Data[]>
    exportFileName?: string
    disableExport?: boolean
    alwaysSelect?: boolean
    selection?: Selection<number>
    noHeaderUpdate?: boolean
    minHeight?: boolean
    toMarkdown?: (data: Data, index: number) => string
    noMode?: boolean
    disableSelect?: boolean
    selectOnly?: boolean
    contentVisibility?: boolean
  }>(),
  {
    count: undefined,
    expansion: undefined,
    useQueryFnExport: undefined,
    queryOptions: undefined,
    bulkDisableMessage: undefined,
    bulk: undefined,
    action: undefined,
    menu: undefined,
    readonlyGetter: undefined,
    readonly: undefined,
    cardClass: undefined,
    cardWrapperClass: undefined,
    defaultMode: ListMode.TABLE,
    formFieldGetter: undefined,
    uniformScope: undefined,
    groupBy: undefined,
    cardTo: undefined,
    refetchInterval: undefined,
    apiMethodExport: undefined,
    exportFileName: undefined,
    selection: undefined,
    toMarkdown: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:error', value: ApiError): void
  (e: 'click:action', value: CardActionParams<Data>): void
  (e: 'update:query-params', value: QueryParams): void
  (e: 'update:count', value: number | undefined): void
  (e: 'update:selection', value: Selection<number>): void
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
} = useListConfig(
  () => props.configKey,
  () => props.fields,
  () => props.defaultConfigMap,
  () => props.defaultMode,
  props.noHeaderSettings,
)

const fieldsFiltered = computed(() => filterFields(fieldsVisible.value, field => fieldConfigMap.value[field.label]?.visible ?? false))

const fieldsSorted = computed(() => isGrid.value ? fieldsFiltered.value : sortFieldsDeep(fieldsFiltered.value, fieldConfigMap.value))

const columnDataMap = computed<Record<string, ColumnData>>(() => {
  const map: Record<string, ColumnData> = {}
  const card = isGrid.value
  const at = !!props.alignTop

  forEachField(fieldsFiltered.value, field => {
    const label = field.meta.label
    const sticky = fieldConfigMap.value[label]?.sticky ?? false
    const stickyInTable = !card && sticky

    map[label] = {
      style: card
        ? {gridArea: label}
        : {
          minWidth: `var(${ getFieldVariable('width', label) })`,
          maxWidth: `var(${ getFieldVariable('width', label) })`,
          left: sticky ? `var(${ getFieldVariable('left', label) })` : undefined,
          right: sticky ? `var(${ getFieldVariable('right', label) })` : undefined,
        },
      baseClass: {
        'items-center': !at,
        'items-start': at,
        'bg-default dark:bg-default-dark sticky z-[1]': stickyInTable,
      },
      sticky: stickyInTable,
    }
  })

  return map
})

const allowSelect = computed(() => !props.disableSelect && (props.alwaysSelect || props.bulk !== undefined || !props.disableExport))
const allowOpen = computed(() => props.expansion !== undefined)
const hasMenu = computed(() => props.menu !== undefined || props.toMarkdown !== undefined)

const disableSelect = computed(() => !allowSelect.value)

const {selection: selectionUsed, updateSelection} = props.selection ? {
  selection: toRef(props, 'selection') as Ref<Selection<number>>,
  updateSelection: (value: Selection<number>) => emit('update:selection', value),
} : useSelectionHash()

const {
  isShift,
  allowSelectHover,
  selectionCount,
  selectAllValue,
  getIsSelected,
  hoverSelected,
  toggleSelected,
  resetSelection,
  selectAll,
  getQueryParams,
  setIsSelecting,
} = useSelected<number>(countValue, disableSelect, selectionUsed, updateSelection, () => props.selectOnly)

const actionMode = computed<ListActionMode>(() => {
  if (props.alwaysSelect && !allowSelect.value) return 'none'
  if (allowSelectHover.value || props.alwaysSelect) return 'select'
  if (props.hasAction) return 'action'
  if (props.cardTo) return 'link'
  if (allowOpen.value) return 'open'
  return 'none'
})

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

const toggleSelectAll = (value: boolean) => {
  if (value) selectAll()
  else resetSelection()
}

const emitClickAction = (value: CardActionParams<Data>) => {
  emit('click:action', value)
}

const updateFieldConfigMap = (value: Record<string, FieldConfig>) => {
  fieldConfigMap.value = value

  updateStylesWidth()
  updateStylesFixed()
}

const updateFieldWidth = (label: string, value: number) => {
  fieldConfigMap.value[label]!.width = value

  updateStylesWidth()
}

const resetConfig = () => {
  reset()

  updateStylesWidth()
  updateStylesFixed()
}

const unwatch = watch(fieldsFiltered, async () => {
  await Promise.all([
    updateStylesWidth(),
    updateStylesFixed(),
  ])

  if (Object.keys(stylesWidth.value).length !== 0 || Object.keys(stylesFixed.value).length !== 0) unwatch.stop()
}, {immediate: true})

watch(listCount, value => emit('update:count', value), {immediate: true})
</script>
