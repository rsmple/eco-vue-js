<template>
  <InfiniteListScroll
    ref="infiniteScroll"
    :scrolling-element="scrollingElement"
    :style="{'--infinite-list-header-height': headerHeight + 'px'}"
    :class="{
      'min-h-[calc(100vh-var(--header-height)-var(--infinite-list-header-height))] pb-16': !minHeight,
      'min-h-full': minHeight,
    }"
    @scroll:down="addNextPage"
    @scroll:up="addPreviousPage"
  >
    <InfiniteListButton
      v-if="isPreviousButtonVisible"
      @click="addPreviousPage()"
      @check="infiniteScrollRef?.checkIsScrollUp()"
    />

    <InfiniteListPage
      v-for="(page, index) in pages"
      ref="pageComponent"
      :key="page"
      :query-params="{...(queryParams as QueryParams), page}"
      :use-query-fn="useQueryFn"
      :skeleton-length="getSkeletonLength(page - 1)"
      :first-page="index === 0"
      :last-page="index === pages.length - 1"
      :hide-page-title="hidePageTitle"
      :transition="transition"
      :resetting="isResettingPage"
      :empty-stub="emptyStub"
      :min-height="minHeight"
      :last-child="lastChild"
      :page-class="pageClass"
      :refetch-interval="refetchInterval"
      :scrolling-element="scrollingElement"
      :query-options="queryOptions"

      :value-getter="valueGetter"

      @update:count="updateCount($event); $emit('update:count', $event)"
      @update:pages-count="updatePagesCount"
      @update:next-page="infiniteScrollRef?.checkIsScrollDown()"
      @update:previous-page="infiniteScrollRef?.checkIsScrollUp()"
      @update:scroll="updateScroll"
      @update-from-header:scroll="headerTop > 0 && nextTick(() => updateScroll(headerTop))"
      @remove:page="removePage"
      @refetch="refetchNextPages(index)"
      @fetched="isResettingPage = false"
      @update:error="$emit('update:error', $event)"
    >
      <template #default="{item, setter, skeleton, refetch, previous, next, first, last, page: itemPage, index: itemIndex}">
        <slot
          :item="(item as Data)"
          :setter="setter"
          :skeleton="skeleton"
          :refetch="refetch"
          :previous="previous ?? pageComponent[index - 1]?.getLast() ?? pageComponent[pageComponent.length - 1]?.getLast()"
          :next="next ?? pageComponent[index + 1]?.getFirst() ?? pageComponent[0]?.getFirst()"
          :first="first"
          :last="last"
          :resetting="isResettingPage"
          :page="itemPage"
          :index="itemIndex"
          :value="valueGetter(item as Data)"
        />
      </template>

      <template
        v-if="$slots.empty"
        #empty="emptyScope"
      >
        <slot
          name="empty"
          v-bind="(emptyScope as EmptyProps)"
        />
      </template>
    </InfiniteListPage>

    <InfiniteListButton
      v-if="count !== 0 && nextPage"
      @click="addNextPage"
      @check="infiniteScrollRef?.checkIsScrollDown()"
    />
  </InfiniteListScroll>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {ApiError} from '@/utils/api'

import {computed, nextTick, ref, toRef, useTemplateRef, watch} from 'vue'

import {isEqualObj} from '@/utils/utils'

import InfiniteListButton from './InfiniteListButton.vue'
import InfiniteListPage from './InfiniteListPage.vue'
import InfiniteListScroll from './InfiniteListScroll.vue'

import {useRefetchNextPages} from '../use/useRefetchNextPages'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    transition?: boolean
    pageLength?: number
    scrollingElement?: Element | null
    headerTop?: number
    headerHeight?: number
    minHeight?: boolean
    lastChild?: boolean
    excludeParams?: (keyof QueryParams)[]
    emptyStub?: string
    pageClass?: string
    maxPages?: number
    refetchInterval?: number | false
    queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>

    valueGetter: (data: Data) => Model
  }>(),
  {
    skeletonLength: undefined,
    pageLength: 24,
    scrollingElement: null,
    headerTop: 0,
    headerHeight: 0,
    excludeParams: undefined,
    emptyStub: undefined,
    pageClass: undefined,
    maxPages: 5,
    refetchInterval: undefined,
    queryOptions: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:page', value: number | undefined): void
  (e: 'update:count', value: number): void
  (e: 'update:error', value: ApiError): void
}>()

const infiniteScrollRef = useTemplateRef('infiniteScroll')

const pages = ref<number[]>([(props.queryParams as {page?: number}).page ?? 1])
const pagesCount = ref(1)
const count = ref(0)
const nextPage = computed(() => pages.value[pages.value.length - 1] !== pagesCount.value ? pages.value[pages.value.length - 1] + 1 : null)
const previousPage = computed(() => pages.value[0] !== 1 ? pages.value[0] - 1 : null)
const isResettingPage = ref(false)

const getSkeletonLength = (pagesBefore: number): number => {
  if (props.skeletonLength === undefined) return props.pageLength

  const length = Math.min(props.skeletonLength - (pagesBefore * props.pageLength), props.pageLength)

  return length < 0 ? props.pageLength : length
}

const isPreviousButtonVisible = computed<boolean>(() => {
  if (pages.value.length === 1 && pages.value[0] > 1) return true
  if (count.value === 0) return false
  if (previousPage.value) return true

  return false
})

const {pageComponent, refetchNextPages} = useRefetchNextPages()

const updateCount = (value: number): void => {
  count.value = value
}

const updatePagesCount = (value: number): void => {
  pagesCount.value = value
}

const addNextPage = (silent?: boolean) => {
  if (!nextPage.value) return
  if (pages.value.includes(nextPage.value)) return

  pages.value.push(nextPage.value)

  if (!silent) emit('update:page', nextPage.value)

  if (pages.value.length < props.maxPages) return

  pages.value.shift()
}

const addPreviousPage = (silent?: boolean) => {
  if (!previousPage.value) return
  if (pages.value.includes(previousPage.value)) return

  pages.value.unshift(previousPage.value)

  if (!silent) emit('update:page', previousPage.value)

  if (pages.value.length < props.maxPages) return

  pages.value.pop()
}

const updateScroll = (height: number): void => {
  const element = props.scrollingElement ?? document.scrollingElement

  if (!element || element.scrollTop === 0) return

  element.scrollTop = element.scrollTop + height
}

const removePage = (page: number): void => {
  const index = pages.value.indexOf(page)

  if (index === -1) return

  const newPages = pages.value.slice(0, index)

  pages.value = newPages

  if (pagesCount.value >= page) pagesCount.value = page - 1

  emit('update:page', pages.value[pages.value.length - 1])
}

const goto = async (page = 1, itemIndex?: number) => {
  const index = pages.value.indexOf(page)
  if (index !== -1) {
    pageComponent.value[index].scrollTo(itemIndex)

    return
  }

  resetPage(page)
}

const resetPage = async (page = 1) => {
  isResettingPage.value = true

  emit('update:page', page === 1 ? undefined : page)
  pages.value = []

  const element = props.scrollingElement ?? document.scrollingElement

  const value = (infiniteScrollRef.value?.$el.offsetTop ?? 0) - props.headerHeight - 60

  if (element && element.scrollTop > value) element.scrollTop = value

  await nextTick()

  pages.value = [page]
}

watch(toRef(props, 'queryParams'), (newValue, oldValue) => {
  if (isEqualObj(newValue, oldValue, ['page', ...(props.excludeParams ?? []) as string[]])) return

  resetPage()
})

watch(pagesCount, value => {
  if (pages.value[pages.value.length - 1] > value) {
    const newPages = pages.value.filter(page => page <= value)

    pages.value = newPages.length === 0 ? [1] : newPages
  }
}, {immediate: true})

defineExpose({
  resetPage,
  goto,
})

type EmptyProps = {queryParams: QueryParams}

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
  empty?: (props: EmptyProps) => void
}>()
</script>
