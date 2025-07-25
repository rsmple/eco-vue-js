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
        :hide-page-title="hidePageTitle"
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

        :value-getter="valueGetter"

        @update:count="$emit('update:count', $event)"
        @update:page="$emit('update:page', $event)"
        @update:error="$emit('update:error', $event)"
      >
        <template #default="{item, value, setter, skeleton, refetch, previous, next, first, last, resetting, page, index}">
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
import type {ApiError} from '@/utils/api'

import {useTemplateRef} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import {getPosition} from '@/utils/useSelected'

import WInfiniteListWrapper from './WInfiniteListWrapper.vue'
import InfiniteListPages from './components/InfiniteListPages.vue'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    transition?: boolean
    headerTopIgnore?: boolean
    minHeight?: boolean
    noHeaderUpdate?: boolean
    lastChild?: boolean
    excludeParams?: (keyof QueryParams)[]
    emptyStub?: string
    pageClass?: string
    maxPages?: number
    refetchInterval?: number | false
    queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>

    pageLength?: number
    count?: number

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
    count: 0,
  },
)

defineEmits<{
  (e: 'update:page', value: number | undefined): void
  (e: 'update:count', value: number): void
  (e: 'update:error', value: ApiError): void
}>()

const infiniteListPagesRef = useTemplateRef<ComponentInstance<typeof InfiniteListPages>>('infiniteListPages')

defineExpose(infiniteListPagesRef.value ?? {})

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
    position: number
    value: Model
  }) => void
  header?: (props: {
    updateHeaderHeight: () => void
  } & typeof infiniteListPagesRef.value) => void
  empty?: () => void
}>()
</script>
