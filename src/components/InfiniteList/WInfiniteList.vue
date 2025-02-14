<template>
  <component
    :is="minHeight ? WEmptyComponent : WInfiniteListWrapper"
    :scrolling-element="scrollingElement"
    :init-is-intersecting="props.queryParams instanceof Object && 'page' in props.queryParams && Number.isInteger(props.queryParams.page) && (props.queryParams.page as number) > 1 ? false : undefined"
  >
    <template #header>
      <slot
        name="header"
        v-bind="{selectAllValue, goto}"
      />
    </template>

    <template #default="defaultScope">
      <InfiniteListPages
        ref="infiniteListPages"
        :query-params="(queryParams as QueryParams)"
        :use-query-fn="useQueryFn"
        :scrolling-element="scrollingElement"

        :skeleton-length="skeletonLength"
        :hide-page-title="hidePageTitle"
        :wrap="wrap"
        :transition="transition"
        :page-length="pageLength"
        :header-top="headerTopIgnore ? 0 : 'headerTop' in defaultScope ? defaultScope.headerTop : 0"
        :header-height="'headerHeight' in defaultScope ? defaultScope.headerHeight : 0"
        :min-height="minHeight"
        :last-child="lastChild"
        :exclude-params="excludeParams"
        :empty-stub="emptyStub"
        :page-class="pageClass"
        :max-pages="maxPages"
        :refetch-interval="refetchInterval"
        :query-options="queryOptions"

        :class="$attrs.class"
        :style="$attrs.style"

        :selected="selected"
        :value-getter="valueGetter"
        :select-only="selectOnly"
        :unselect-only="unselectOnly"
        :reverse-selection="reverseSelection"
        :allow-page-selection="allowPageSelection"

        @update:selected="$emit('select', $event)"

        @update:count="$emit('update:count', $event)"
        @update:page="$emit('update:page', $event)"
        @update:error="$emit('update:error', $event)"
      >
        <template #default="{item, value, setter, skeleton, refetch, previous, next, first, last, resetting, page, index}">
          <component
            :is="skeleton ? WEmptyComponent : InfiniteListPageSelectItem"
            :selected="skeleton ? false : getIsSelected(value)"
            :selected-between="skeleton ? false : getIsSelectedBetween(value, page, index)"
            @update:selected="
              toggleSelected(value, reverse && !selectedRange ? !$event : $event);
              setSelectedCursor($event ? {page, index, id: value} : null);
            "
            @update:selected-range="setSelectedRange({page, index, id: value})"
            @update:selected-range-hover="setRangeHover({page, index, id: value})"
          >
            <slot
              :item="item"
              :setter="setter"
              :skeleton="skeleton"
              :refetch="refetch"
              :previous="previous"
              :next="next"
              :first="first"
              :last="last"
              :resetting="resetting"
              :page="page"
              :index="index"
              :value="value"
            />
          </component>
        </template>
      </InfiniteListPages>
    </template>
  </component>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {ApiError} from '@/utils/api'

import {provide, toRef, useTemplateRef} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import WInfiniteListWrapper from './WInfiniteListWrapper.vue'
import InfiniteListPageSelectItem from './components/InfiniteListPageSelectItem.vue'
import InfiniteListPages from './components/InfiniteListPages.vue'
import {wInfiniteListSelection} from './models/injection'
import {useSelected} from './use/useSelected'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    wrap?: boolean
    transition?: boolean
    scrollingElement?: Element | null
    headerTopIgnore?: boolean
    minHeight?: boolean
    lastChild?: boolean
    excludeParams?: (keyof QueryParams)[]
    emptyStub?: string
    pageClass?: string
    maxPages?: number
    refetchInterval?: number | false
    queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>

    pageLength?: number
    count?: number

    allowSelect?: boolean
    allowSelectRange?: boolean

    valueGetter?: (data: Data) => Model
    selected?: Model[]
    selectedRange?: SelectedRange<Model>
    reverse?: boolean

    selectOnly?: boolean
    unselectOnly?: boolean
    reverseSelection?: boolean
    allowPageSelection?: boolean
  }>(),
  {
    skeletonLength: undefined,
    selected: () => [],
    scrollingElement: undefined,
    excludeParams: undefined,
    emptyStub: undefined,
    pageClass: undefined,
    maxPages: undefined,
    refetchInterval: undefined,
    valueGetter: (item: Data) => (item.id as Model),
    queryOptions: undefined,

    pageLength: 24,
    count: 0,
    selectedRange: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:page', value: number | undefined): void
  (e: 'update:count', value: number): void

  (e: 'select', values: Model[]): void
  (e: 'select-reverse', values: Model[]): void
  (e: 'select-range', value: SelectedRange<Model>): void
  (e: 'update:error', value: ApiError): void
}>()

const infiniteListPagesRef = useTemplateRef('infiniteListPages')

const goto = (page: number, itemIndex?: number) => {
  infiniteListPagesRef.value?.goto(page, itemIndex)
}

const {
  setSelectedRange,
  getIsSelected,
  getIsSelectedBetween,
  allowSelectHover,
  setRangeHover,
  setSelectedCursor,
  toggleSelected,
  selectedCount,
  selectAllValue,
} = useSelected<Model>(
  toRef(props, 'count'),
  toRef(props, 'pageLength'),
  toRef(props, 'selected'),
  toRef(props, 'reverse'),
  toRef(props, 'selectedRange'),

  (value) => emit('select', value),
  (value) => emit('select-reverse', value),
  (value) => emit('select-range', value),
)

provide(wInfiniteListSelection, {
  allowSelect: toRef(props, 'allowSelect'),
  allowSelectRange: toRef(props, 'allowSelectRange'),
  allowSelectHover,
  selectedCount,
  clearSelected: () => emit('select', []),
})

defineExpose({
  resetPage() {
    infiniteListPagesRef.value?.resetPage()
  },
})

defineSlots<{
  default?: (props: {
    item: Data
    setter: (newItem?: Data | undefined) => void
    skeleton: boolean
    refetch: () => void
    previous?: Data
    next?: Data
    first: boolean
    last: boolean
    resetting: boolean
    page: number
    index: number
    value: Model
  }) => void
  header?: (props: {
    goto: typeof goto
    selectAllValue: typeof selectAllValue.value
  }) => void
}>()
</script>
