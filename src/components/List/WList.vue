<template>
  <div
    role="list"
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
      :page-class="
        isGrid
          ? 'grid grid-cols-[repeat(auto-fill,minmax(var(--w-list-card-width,16rem),1fr))] gap-(--w-list-gap,0) isolate'
          : 'grid grid-cols-1 gap-(--w-list-gap,0) isolate'
      "
      :min-height-only="minHeight"
      :no-header-update="noHeaderUpdate"
      :style="cardStyles"
      :class="$attrs.class"

      @update:count="listCount = $event; $emit('update:count', $event)"
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

import {type Ref, type StyleValue, computed, nextTick, onMounted, ref, toRef, watch} from 'vue'

import WInfiniteList from '@/components/InfiniteList/WInfiniteList.vue'

import {useIsMobile} from '@/utils/mobile'
import {type OrderItem, encodeOrdering, parseOrdering} from '@/utils/order'
import {useComponentStates} from '@/utils/useComponentStates'
import {type DefaultQueryOptions, PAGE_LENGTH} from '@/utils/useDefaultQuery'
import {type Selection, useSelected, useSelectionHash} from '@/utils/useSelected'
import {ListMode} from '@/utils/utils'

import ListItem from './components/ListItem.vue'
import ListToolbar from './components/ListToolbar.vue'
import {AREA_MORE, AREA_SELECT} from './types'
import {filterFields, forEachField, getFieldStylesFixed, getFieldStylesWidth, getFieldVariable, sortFields, sortFieldsDeep, useListConfig} from './use/useListConfig'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<{
    /** Total number of items, when known in advance. Sizes the skeleton and the select-all. Defaults to the count the query returns. */
    count?: number
    /** Field components, one per column, each with a `meta` export for its title, label, ordering field and classes. A meta with `fields` groups nested fields. */
    fields: Fields
    /** Detail component shown under a row when the row is clicked. Receives the same props as a field, except `config`. */
    expansion?: ExpansionComponent<Data, QueryParams>
    /** Paginated query the pages are loaded with. */
    useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
    /** Paginated query for export, when it differs from `useQueryFn`. */
    useQueryFnExport?: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
    /** Params for `useQueryFn`. An `ordering` param drives the sort controls and the sortable column headers. */
    queryParams: QueryParams
    /** Options for every page query. */
    queryOptions?: DefaultQueryOptions<PaginatedResponse<Data>>
    /** Tooltip on the `bulk` actions while nothing is selected. Defaults to "No selected items". */
    bulkDisableMessage?: string
    /** Singular noun in the "Selected N items" counter of the selection bar. */
    selectionTitle: string
    /** Actions in the selection bar while items are selected. Each gets the selection count and a getter of the query params narrowed to the selection. From the third on they move into a More menu. */
    bulk?: BulkComponent<QueryParams>[]
    /** Actions in the selection bar while nothing is selected, with the current query params. */
    action?: ActionComponent<QueryParams>[]
    /** Row menu items, opened by the row's more button or a right click. A `[component, props]` tuple passes extra props. */
    menu?: MenuComponent<Data>[]
    /** Makes a single row readonly. */
    readonlyGetter?: (item: Data) => boolean
    /** Classes for each row's content box. */
    cardClass?: string
    /** Classes for each row's outer box. */
    cardWrapperClass?: string
    /** Tooltip of the select-all checkbox in the table header. */
    selectAllTextGetter: (isUnselect: boolean, count: number) => string
    /** Draws a border around each row. */
    hasBorder?: boolean
    /** `localStorage` key the column settings and view mode are saved under. */
    configKey: string
    /** Width, visibility, order and stickiness of each field by label, until the user changes them. */
    defaultConfigMap: FieldConfigMap<Fields>
    /** Table or grid view, until the user picks one. Small screens always show cards. */
    defaultMode?: ListMode
    /** Aligns cells and the checkbox to the top of the row instead of centering them. */
    alignTop?: boolean
    /** Disables the row menu, both the more button and the right click. */
    disableMore?: boolean
    /** Makes every row readonly, and passes `readonly` to the `bulk`, `action` and `menu` components. When unset, inherits the readonly state provided by a parent. */
    readonly?: boolean
    /** Hides the sort control and makes the column headers not sortable. */
    noOrdering?: boolean
    /** Wraps a row in WUniform for the returned field of `uniformScope`, so its fields can edit the item as part of a form. `undefined` leaves the row unwrapped. */
    formFieldGetter?: (data: Data, index: number) => string | undefined
    /** Form scope of the items, for `formFieldGetter`. */
    uniformScope?: UniformScope<Data[]>
    /** Whether two neighbouring items are in the same group. The `group` slot renders before each new group. */
    groupBy?: (a: Data, b: Data) => boolean
    /** Column widths of the card grid. */
    cardColumns: CardColumns
    /** Rows of the card grid, as area names: field labels, `AREA_SELECT`, `AREA_MORE` or `.`. Areas of hidden fields are dropped, and so are rows and columns left empty. */
    cardAreas: CardAreas<Fields, CardColumns['length']>
    /** Route a row links to. */
    cardTo?: (item: Data) => LinkProps['to'] | undefined
    /** Makes a row click emit `click:action`. */
    hasAction?: boolean
    /** Hides the column settings button, and neither loads nor saves column settings. */
    noHeaderSettings?: boolean
    /** Hides the refetch button. */
    noRefetch?: boolean
    /** Refetches the loaded pages every this many ms. */
    refetchInterval?: number
    /** Loads the items to export in one call, instead of paging through the export query. */
    apiMethodExport?: (queryParams: QueryParams) => Promise<Data[]>
    /** Name of the exported file. */
    exportFileName?: string
    /** Hides the export button. Rows are then selectable only with `bulk` or `alwaysSelect`. */
    disableExport?: boolean
    /** Shows the checkboxes even without `bulk` or export, and makes a row click toggle its selection. With `cardTo`, the row link moves into a View menu item. */
    alwaysSelect?: boolean
    /** Selected items, controlled from outside with `update:selection`. By default the selection is kept in the URL hash. */
    selection?: Selection<number>
    /** Keeps the sticky list header out of the app header bar's padding while scrolled. */
    noHeaderUpdate?: boolean
    /** Drops the full-screen minimum height and the bottom padding, for a list inside other content. */
    minHeight?: boolean
    /** Converts an item to Markdown. Adds a Copy as Markdown item to the row menu and a Markdown option to export. */
    toMarkdown?: (data: Data, index: number) => string
    /** Hides the table and grid switch in the column settings. */
    noMode?: boolean
    /** Hides the checkboxes and turns selection off. */
    disableSelect?: boolean
    /** Allows only picking rows one by one — no select-all and no Shift range selection. */
    selectOnly?: boolean
    /** Skips rendering rows outside the viewport with `content-visibility: auto`, for long lists. */
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
  /** A page query failed. */
  (e: 'update:error', value: ApiError): void
  /** A row was clicked, with `hasAction`. Carries the item, a setter that replaces it and its form scope. */
  (e: 'click:action', value: CardActionParams<Data>): void
  /** The changed params only — the new `ordering`, from the sort control or a column header. */
  (e: 'update:query-params', value: QueryParams): void
  /** Total count returned by the query. */
  (e: 'update:count', value: number | undefined): void
  /** The new selection, with `selection`. */
  (e: 'update:selection', value: Selection<number>): void
}>()

defineSlots<{
  /** Content above the selection bar, with the count returned by the query. */
  header?: (props: {count: number | undefined}) => void
  /** Replaces the buttons at the end of the selection bar — range select, refetch, sort and column settings. */
  selection?: () => void
  /** Heading before each group of rows, with `groupBy`. `skeleton` is true while the page loads. */
  group?: (props: {item: Data, previous: Data | undefined, skeleton: boolean}) => void
  /** Shown instead of the rows when the query returns no items. */
  empty?: () => void
}>()

const {isDisabled, isReadonly} = useComponentStates(props)

const {isMobile} = useIsMobile()

const listCount = ref<number | undefined>(undefined)

const countValue = computed(() => props.count ?? listCount.value)

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
        'bg-surface sticky z-[1]': stickyInTable,
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

const cardStyles = computed<StyleValue>(() => {
  const cardColumns = props.cardColumns
  const cardAreas = props.cardAreas

  if (!cardColumns || !cardAreas) return

  const isAreaShown = (area: string): boolean => {
    if (area === AREA_SELECT) return allowSelect.value
    if (area === AREA_MORE) return hasMenu.value

    return area in columnDataMap.value
  }

  const areas = cardAreas
    .map(row => row.map(area => isAreaShown(area) ? area : '.'))
    .filter(row => row.some(area => area !== '.'))

  // drop rows left with only areas that span into another kept row (e.g. AREA_SELECT beside a hidden field)
  const rowsKept = areas.map(() => true)
  areas.forEach((row, rowIndex) => {
    const isRedundant = row.every(area => area === '.' || areas.some((other, otherIndex) => otherIndex !== rowIndex && rowsKept[otherIndex] && other.includes(area)))
    if (isRedundant) rowsKept[rowIndex] = false
  })
  const rows = areas.filter((_, index) => rowsKept[index])

  const colsShown = cardColumns.map((_, index) => rows.some(row => row[index] !== '.'))
  const areasShown = rows.map(row => row.filter((_, index) => colsShown[index]))

  if (!areasShown.length) return

  return {
    '--w-list-grid-cols': cardColumns.filter((_, index) => colsShown[index]).join(' '),
    '--w-list-grid-areas': areasShown.map(row => `"${ row.join(' ') }"`).join('\n'),
  }
})

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

// The saved config loads on mount, after the watcher below may have stopped on the defaults' styles.
onMounted(() => {
  updateStylesWidth()
  updateStylesFixed()
})

const unwatch = watch(fieldsFiltered, async () => {
  await Promise.all([
    updateStylesWidth(),
    updateStylesFixed(),
  ])

  if (Object.keys(stylesWidth.value).length !== 0 || Object.keys(stylesFixed.value).length !== 0) unwatch.stop()
}, {immediate: true})
</script>
