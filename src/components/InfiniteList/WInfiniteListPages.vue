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
    />

    <InfiniteListPage
      v-for="(page, index) in pages"
      ref="pageComponent"
      :key="page"
      :query-params="{...queryParams, page}"
      :use-query-fn="useQueryFn"
      :is-invalid-page="isInvalidPage"
      :skeleton-length="getSkeletonLength(page - 1)"
      :first-page="index === 0"
      :last-page="index === pages.length - 1"
      :hide-page-title="hidePageTitle"
      :selected="selected"
      :wrap="wrap"
      :no-gap="noGap"
      :transition="transition"
      :resetting="isResettingPage"
      :empty-stub="emptyStub"
      :select-only="selectOnly"
      :unselect-only="unselectOnly"
      :reverse-selection="reverseSelection"
      :allow-page-selection="allowPageSelection"
      :min-height="minHeight"
      :page-class="pageClass"
      :refetch-interval="refetchInterval"
      :scrolling-element="scrollingElement"
      :value-getter="valueGetter"

      :class="{
        'last:min-h-[calc(100vh-var(--header-height)-var(--infinite-list-header-height))] last:pb-16': !minHeight,
      }"

      @update:count="updateCount"
      @update:pages-count="updatePagesCount"
      @update:next-page="updateNextPage($event); infiniteScroll?.checkIsScrollDown()"
      @update:previous-page="updatePreviousPage($event); infiniteScroll?.checkIsScrollUp()"
      @update:scroll="updateScroll"
      @update-from-header:scroll="headerTop > 0 && nextTick(() => updateScroll(headerTop))"
      @error:invalid-page="removePage"
      @refetch="refetchNextPages(index)"
      @update:selected="$emit('update:selected', $event)"
      @fetched="isResettingPage = false"
    >
      <template #default="{item, setter, skeleton, refetch, previous, next, first, last}">
        <slot
          :item="item"
          :setter="setter"
          :skeleton="skeleton"
          :refetch="refetch"
          :previous="previous ?? pageComponent[index - 1]?.getLast() ?? pageComponent[pageComponent.length - 1]?.getLast()"
          :next="next ?? pageComponent[index + 1]?.getFirst() ?? pageComponent[0]?.getFirst()"
          :first="first"
          :last="last"
          :resetting="isResettingPage"
        />
      </template>
    </InfiniteListPage>

    <InfiniteListButton
      v-if="count !== 0 && nextPage"
      @click="addNextPage"
    />
  </InfiniteListScroll>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData">
import {ref, computed, watch, toRef, nextTick} from 'vue'
import InfiniteListScroll from './components/InfiniteListScroll.vue'
import InfiniteListPage from './components/InfiniteListPage.vue'
import {useRefetchNextPages} from './use/useRefetchNextPages'
import InfiniteListButton from './components/InfiniteListButton.vue'
import {isEqualObj} from '@/utils/utils'
import {getIsScrollDown} from './models/utils'

const props = withDefaults(
  defineProps<{
    useQueryFn: UsePaginatedQuery<Data>
    isInvalidPage: (error: unknown) => boolean
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    skipScrollTarget?: boolean
    selected?: Model[]
    wrap?: boolean
    noGap?: boolean
    transition?: boolean
    pageLength?: number
    scrollingElement?: Element | null
    headerTop?: number
    headerHeight?: number
    minHeight?: boolean
    excludeParams?: string[]
    emptyStub?: string
    selectOnly?: boolean
    unselectOnly?: boolean
    reverseSelection?: boolean
    allowPageSelection?: boolean
    pageClass?: string
    maxPages?: number
    refetchInterval?: number | false
    valueGetter: (data: Data) => Model
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
  },
)

const emit = defineEmits<{
  (e: 'update:page', value: number | undefined): void
  (e: 'update:count', value: number): void
  (e: 'update:selected', values: Model[]): void
}>()

const infiniteScroll = ref<ComponentInstance<typeof InfiniteListScroll> | undefined>()

const pages = ref<number[]>([props.queryParams.page ?? 1])
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

  if (!element) return

  element.scrollTop = element.scrollTop + height
}

const removePage = (page: number): void => {
  const index = pages.value.indexOf(page)

  if (index === -1) return

  pages.value.splice(index, pages.value.length - index)

  if (!pages.value.length) pages.value = [1]

  emit('update:page', pages.value[pages.value.length - 1])
}

const resetPage = () => {
  isResettingPage.value = true

  emit('update:page', undefined)
  pages.value = [1]
  nextPage.value = null
  previousPage.value = null

  if (!props.skipScrollTarget) (props.scrollingElement ?? document.scrollingElement)?.scrollTo(0, props.headerTop)
}

watch(toRef(props, 'queryParams'), (newValue, oldValue) => {
  if (isEqualObj(newValue, oldValue, ['page', ...(props.excludeParams ?? [])])) return

  resetPage()
})

watch(count, value => emit('update:count', value), {immediate: true})

defineExpose({
  resetPage,
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
  }) => void
}>()

</script>
