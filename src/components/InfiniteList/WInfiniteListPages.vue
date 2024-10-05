<template>
  <InfiniteListScroll
    ref="infiniteScroll"
    :scrolling-element="scrollingElement"
    :style="{'--infinite-list-header-height': headerHeight + 'px'}"
    @scroll:down="addNextPage"
    @scroll:up="addPreviousPage"
  >
    <InfiniteListButton
      v-if="isPreviousButtonVisible"
      @click="addPreviousPage()"
      @check="infiniteScroll?.checkIsScrollUp"
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
      :wrap="wrap"
      :no-gap="noGap"
      :transition="transition"
      :resetting="isResettingPage"
      :empty-stub="emptyStub"
      :min-height="minHeight"
      :last-child="lastChild"
      :page-class="pageClass"
      :refetch-interval="refetchInterval"
      :scrolling-element="scrollingElement"
      :query-options="queryOptions"

      :selected="selected"
      :value-getter="valueGetter"
      :select-only="selectOnly"
      :unselect-only="unselectOnly"
      :reverse-selection="reverseSelection"
      :allow-page-selection="allowPageSelection"
      @update:selected="$emit('update:selected', $event)"

      @update:count="updateCount"
      @update:pages-count="updatePagesCount"
      @update:next-page="updateNextPage($event)"
      @update:previous-page="updatePreviousPage($event)"
      @update:scroll="updateScroll"
      @update-from-header:scroll="headerTop > 0 && nextTick(() => updateScroll(headerTop))"
      @remove:page="removePage"
      @refetch="refetchNextPages(index)"
      @fetched="isResettingPage = false"
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
        />
      </template>
    </InfiniteListPage>

    <InfiniteListButton
      v-if="count !== 0 && nextPage"
      @click="addNextPage"
      @check="infiniteScroll?.checkIsScrollDown"
    />
  </InfiniteListScroll>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import {ref, computed, watch, toRef, nextTick} from 'vue'
import InfiniteListScroll from './components/InfiniteListScroll.vue'
import InfiniteListPage from './components/InfiniteListPage.vue'
import {useRefetchNextPages} from './use/useRefetchNextPages'
import InfiniteListButton from './components/InfiniteListButton.vue'
import {isEqualObj} from '@/utils/utils'
import {getIsScrollDown} from './models/utils'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    skipScrollTarget?: boolean
    wrap?: boolean
    noGap?: boolean
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
    queryOptions?: Partial<Parameters<UseQueryPaginated<Data, QueryParams>>[1]>

    selected?: Model[]
    valueGetter: (data: Data) => Model
    selectOnly?: boolean
    unselectOnly?: boolean
    reverseSelection?: boolean
    allowPageSelection?: boolean
  }>(),
  {
    skeletonLength: undefined,
    selected: undefined,
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
  (e: 'update:selected', values: Model[]): void
}>()

const infiniteScroll = ref<ComponentInstance<typeof InfiniteListScroll> | undefined>()

const pages = ref<number[]>([(props.queryParams as {page?: number}).page ?? 1])
const pagesCount = ref(1)
const count = ref(0)
const nextPage = ref<number | null>()
const previousPage = ref<number | null>()
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

const updateNextPage = (value: number | null): void => {
  nextPage.value = value

  if (pages.value.length === 1 && getIsScrollDown(props.scrollingElement)) addNextPage(true)
}

const updatePreviousPage = (value: number | null): void => {
  previousPage.value = value

  if (pages.value.length === 1) addPreviousPage(true)
}

const addNextPage = (silent?: boolean) => {
  if (!nextPage.value) return
  if (pages.value.includes(nextPage.value)) return

  pages.value.push(nextPage.value)

  if (!silent) emit('update:page', nextPage.value)

  if (pages.value.length < props.maxPages) return

  const firstPage = pages.value.shift()

  if (firstPage === undefined) return

  previousPage.value = firstPage
}

const addPreviousPage = (silent?: boolean) => {
  if (!previousPage.value) return
  if (pages.value.includes(previousPage.value)) return

  pages.value.unshift(previousPage.value)

  if (!silent) emit('update:page', previousPage.value)

  if (pages.value.length < props.maxPages) return

  const lastPage = pages.value.pop()

  if (lastPage === undefined) return

  nextPage.value = lastPage
}

const updateScroll = (height: number): void => {
  const element = props.scrollingElement ?? document.scrollingElement

  if (!element || element.scrollTop === 0) return

  element.scrollTop = element.scrollTop + height
}

const removePage = (page: number): void => {
  const index = pages.value.indexOf(page)

  if (index === -1) return

  const newPages = pages.value.slice(0, pages.value.length - index)

  pages.value = newPages.length === 0 ? [1] : newPages

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

  await nextTick()

  pages.value = [page]
  nextPage.value = null
  previousPage.value = null

  if (!props.skipScrollTarget) (props.scrollingElement ?? document.scrollingElement)?.scrollTo(0, props.headerTop)
}

watch(toRef(props, 'queryParams'), (newValue, oldValue) => {
  if (isEqualObj(newValue, oldValue, ['page', ...(props.excludeParams ?? []) as string[]])) return

  if (pages.value.length === 1 && pages.value[0] === 1) return

  resetPage()
})

watch(count, value => emit('update:count', value), {immediate: true})

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
  }) => void
}>()

</script>
