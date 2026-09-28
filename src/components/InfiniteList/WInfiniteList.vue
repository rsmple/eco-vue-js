<template>
  <component
    :is="minHeight ? WEmptyComponent : WInfiniteListWrapper"
    :init-is-intersecting="props.queryParams instanceof Object && 'page' in props.queryParams && Number.isInteger(props.queryParams.page) && (props.queryParams.page as number) > 1 ? false : undefined"
    :no-header-update="noHeaderUpdate"
  >
    <template #header="headerScope">
      <slot
        name="header"
        v-bind="{...infiniteListPagesRef ?? {}, ...headerScope ?? {}}"
      />
    </template>

    <template #default="defaultScope">
      <InfiniteListPages
        ref="infiniteListPages"
        :query-params="(queryParams as QueryParams)"
        :use-query-fn="useQueryFn"

        :skeleton-length="skeletonLength"
        :transition="transition"
        :page-length="pageLength"
        :header-height="'headerHeight' in defaultScope ? defaultScope.headerHeight : 0"
        :min-height="minHeight"
        :min-height-only="minHeightOnly"
        :exclude-params="excludeParams"
        :empty-stub="emptyStub"
        :page-class="pageClass"
        :max-pages="maxPages"
        :refetch-interval="refetchInterval"
        :query-options="queryOptions"

        :class="$attrs.class"
        :style="$attrs.style"

        :value-getter="valueGetter"

        @update:count="$emit('update:count', $event)"
        @update:page="$emit('update:page', $event)"
        @update:error="$emit('update:error', $event)"
      >
        <template #default="{item, value, setter, skeleton, refetch, previous, next, first, last, resetting, page, index, results, intersecting}">
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
            :position="getPosition(page, index, pageLength)"
            :value="value"
            :results="results"
            :intersecting="intersecting"
          />
        </template>

        <template
          v-if="$slots.empty"
          #empty
        >
          <slot name="empty" />
        </template>
      </InfiniteListPages>
    </template>
  </component>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {InfiniteListHeaderScope, InfiniteListScope} from './types'
import type {ApiError} from '@/utils/api'
import type {DefaultQueryOptions} from '@/utils/useDefaultQuery'

import {computed, useTemplateRef} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import {getPosition} from '@/utils/useSelected'

import WInfiniteListWrapper from './WInfiniteListWrapper.vue'
import InfiniteListPages from './components/InfiniteListPages.vue'

const props = withDefaults(
  defineProps<{
    /** Paginated query the pages are loaded with. Each page gets `queryParams` with its `page` and `size`. */
    useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
    /** Params of the query. A change resets the list to the first page. A `page` starts the list at that page. */
    queryParams: QueryParams
    /** Number of skeleton items while the first pages load, e.g. the known total count. Defaults to a full page. */
    skeletonLength?: number
    /** Animates items as they are added or removed. */
    transition?: boolean
    /** Renders without the sticky header and fills the height of its container, e.g. for a list inside a dropdown. */
    minHeight?: boolean
    /** Drops the full-screen minimum height and the bottom padding, for a list inside other content. */
    minHeightOnly?: boolean
    /** Keeps the sticky header out of the app header bar's padding while scrolled. */
    noHeaderUpdate?: boolean
    /** Params whose change refetches the loaded pages in place instead of resetting the list to the first page. */
    excludeParams?: (keyof QueryParams)[]
    /** Text shown when the query returns no items. The `empty` slot replaces it. */
    emptyStub?: string
    /** Class of each page's element, e.g. a grid layout for the items. */
    pageClass?: string
    /** Number of pages kept rendered, 5 by default. Scrolling further drops pages at the other end, keeping their height as space. */
    maxPages?: number
    /** Refetches the pages in view every this many ms. */
    refetchInterval?: number | false
    /** Options for every page query. */
    queryOptions?: DefaultQueryOptions<PaginatedResponse<Data>>

    /** Page size, sent to the query as `size`. Must match the size the query returns. */
    pageLength?: number

    /** Unique value of an item, for the item's key and the `value` slot prop. Defaults to its `id`. */
    valueGetter?: (data: Data) => Model
  }>(),
  {
    skeletonLength: undefined,
    excludeParams: undefined,
    emptyStub: undefined,
    pageClass: undefined,
    maxPages: undefined,
    refetchInterval: undefined,
    valueGetter: (item: Data) => (item as unknown as {id: Model}).id,
    queryOptions: undefined,

    pageLength: 24,
  },
)

defineEmits<{
  /** The page reached by scrolling, for keeping it in the URL. `undefined` after a reset to the first page. */
  (e: 'update:page', value: number | undefined): void
  /** Total number of items, from the query's `count`. */
  (e: 'update:count', value: number): void
  /** A page query failed. A page that answers 404 or 400 is dropped, and the list ends before it. */
  (e: 'update:error', value: ApiError): void
}>()

const infiniteListPagesRef = useTemplateRef<ComponentInstance<typeof InfiniteListPages>>('infiniteListPages')

defineExpose({
  resetPage: async (page?: number) => infiniteListPagesRef.value?.resetPage(page),
  goto: async (page?: number, itemIndex?: number) => infiniteListPagesRef.value?.goto(page, itemIndex),
  refetchAll: () => infiniteListPagesRef.value?.refetchAll(),
  isFetching: computed(() => infiniteListPagesRef.value?.isFetching ?? false),
  isRefetchingAll: computed(() => infiniteListPagesRef.value?.isRefetchingAll ?? false),
})

defineSlots<{
  /** An item, or a skeleton placeholder while its page loads. `setter` writes a changed item to the query cache, or removes it when called with nothing; `position` is the item's index in the whole list. */
  default?: (props: {
    item: Data
    setter: (newItem?: Data | undefined) => void
    skeleton: boolean
    refetch: () => void
    previous: Data | undefined
    next: Data | undefined
    first: boolean
    last: boolean
    resetting: boolean
    page: number
    index: number
    position: number
    value: Model
    results: Data[] | undefined
    intersecting: boolean
  }) => void
  /** Sticky content above the items, such as a toolbar. Gets `refetchAll`, `resetPage`, `goto`, `isFetching` and `isRefetchingAll`, and `updateHeader` to re-measure it right away. */
  header?: (props: InfiniteListHeaderScope & Partial<InfiniteListScope>) => void
  /** Shown when the query returns no items. Replaces `emptyStub`. */
  empty?: () => void
}>()
</script>
