<template>
  <InfiniteListScroll
    ref="infiniteScroll"
    :style="{'--infinite-list-header-height': headerHeight + 'px'}"
    :class="{
      'min-h---height-inner list:pt-(--w-list-gap,1rem) modal:pb-(--w-list-gap,1rem) modal:min-h-[50vh] pb-16': !minHeight && !minHeightOnly,
      'min-h-full': minHeight,
      'list:pt-(--w-list-gap,1rem) modal:pb-(--w-list-gap,1rem)': minHeightOnly,
    }"
  >
    <div :style="{height: topSpacerHeight + 'px'}" />
    <div ref="topSentinel" />

    <div
      ref="items"
      :class="pageClass"
    >
      <div
        v-if="columnOffset"
        aria-hidden="true"
        :style="{gridColumn: 'span ' + columnOffset}"
      />

      <InfiniteListPage
        v-for="(page, index) in pages"
        ref="pageComponent"
        :key="slotIds[index]"
        :query-params="{...(queryParams as QueryParams), page, size: pageLength}"
        :use-query-fn="useQueryFn"
        :skeleton-length="getSkeletonLength(page - 1)"
        :first-page="index === 0"
        :last-page="index === pages.length - 1"
        :transition="transition"
        :resetting="isResettingPage"
        :empty-stub="emptyStub"
        :refetch-interval="refetchInterval"
        :query-options="queryOptions"
        :enabled="!disabledSlots.has(slotIds[index]!)"

        :value-getter="valueGetter"

        @update:count="updateCount($event); $emit('update:count', $event)"
        @update:pages-count="updatePagesCount"
        @update:page-size="pageSize = $event"
        @remove:page="removePage"
        @refetch="refetchNextPages(page)"
        @fetched="isResettingPage = false"
        @update:error="$emit('update:error', $event)"
      >
        <template #default="{item, setter, skeleton, refetch, previous, next, first, last, page: itemPage, index: itemIndex, results, intersecting}">
          <slot
            :item="(item as Data)"
            :setter="setter"
            :skeleton="skeleton || isRefetchingAll"
            :refetch="refetch"
            :previous="((previous ?? getPageComponent(page - 1)?.getLast()) as Data | undefined)"
            :next="((next ?? getPageComponent(page + 1)?.getFirst()) as Data | undefined)"
            :first="first"
            :last="last"
            :resetting="isResettingPage"
            :page="itemPage"
            :index="itemIndex"
            :value="valueGetter(item as Data)"
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

        <template
          v-if="$slots.error"
          #error="scope"
        >
          <slot
            name="error"
            v-bind="scope"
          />
        </template>
      </InfiniteListPage>
    </div>

    <div ref="bottomSentinel" />
    <div :style="{height: bottomSpacerHeight + 'px'}" />
  </InfiniteListScroll>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {ApiError} from '@/utils/api'
import type {DefaultQueryOptions} from '@/utils/useDefaultQuery'

import {computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, useTemplateRef, watch} from 'vue'

import {debounce, getIsClientSide, getOffsetTop, isEqualObj} from '@/utils/utils'

import InfiniteListPage from './InfiniteListPage.vue'
import InfiniteListScroll from './InfiniteListScroll.vue'

import {wScrollingElement} from '../models/injection'
import {useRefetchNextPages} from '../use/useRefetchNextPages'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
    queryParams: QueryParams
    skeletonLength?: number
    transition?: boolean
    pageLength?: number
    headerHeight?: number
    minHeight?: boolean
    minHeightOnly?: boolean
    excludeParams?: (keyof QueryParams)[]
    emptyStub?: string
    pageClass?: string
    maxPages?: number
    refetchInterval?: number | false
    queryOptions?: DefaultQueryOptions<PaginatedResponse<Data>>

    valueGetter: (data: Data) => Model
  }>(),
  {
    skeletonLength: undefined,
    pageLength: 24,
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

const scrollingElement = inject(wScrollingElement, null)

const pages = ref<number[]>([(props.queryParams as {page?: number}).page ?? 1])
let slotIdCounter = 1
const slotIds = ref<number[]>([slotIdCounter])
const pagesCount = ref(1)
const count = ref(0)
/** Items on a full page as the API returns them, which can differ from the `size` the list asks for. */
const pageSize = ref(props.pageLength)
const nextPage = computed(() => {
  if (pagesCount.value === 0) return null
  const max = Math.max(...pages.value, 0)
  return max < pagesCount.value ? max + 1 : null
})
const previousPage = computed(() => {
  if (pagesCount.value === 0 || pages.value.length === 0) return null
  const min = Math.min(...pages.value)
  return min > 1 ? min - 1 : null
})
const isResettingPage = ref(false)

const disabledSlots = reactive(new Set<number>())
let activationGen = 0

/** Items on the page by the total count, a full page while the count is not known. */
const getPageItemCount = (page: number): number => {
  const remaining = count.value - (page - 1) * pageSize.value

  return remaining > 0 ? Math.min(remaining, pageSize.value) : pageSize.value
}

const getSkeletonLength = (pagesBefore: number): number => {
  const itemCount = getPageItemCount(pagesBefore + 1)

  if (props.skeletonLength === undefined) return itemCount

  const length = Math.min(props.skeletonLength - (pagesBefore * pageSize.value), itemCount)

  return length < 0 ? itemCount : length
}

const pageComponentRef = useTemplateRef<ComponentInstance<typeof InfiniteListPage>[]>('pageComponent')
const itemsRef = useTemplateRef<HTMLDivElement>('items')
const topSentinelRef = useTemplateRef<HTMLDivElement>('topSentinel')
const bottomSentinelRef = useTemplateRef<HTMLDivElement>('bottomSentinel')

const {isFetching, isRefetchingAll, refetchNextPages, refetchAll} = useRefetchNextPages(pageComponentRef)

const updateCount = (value: number): void => {
  count.value = value
}

const updatePagesCount = (value: number): void => {
  pagesCount.value = Math.max(value, 1)
}

/** The end a page was last added at, whose sentinel is observed anew once the pages have rendered. */
let grownTowards: 'top' | 'bottom' | null = null

const addNextPage = (silent?: boolean) => {
  if (!nextPage.value) return
  if (pages.value.includes(nextPage.value)) return

  grownTowards = 'bottom'

  if (pages.value.length >= props.maxPages) {
    const recycledSlotId = slotIds.value.shift()!
    pages.value.shift()
    pages.value.push(nextPage.value)
    slotIds.value.push(recycledSlotId)
  } else {
    pages.value.push(nextPage.value)
    slotIds.value.push(++slotIdCounter)
  }

  if (!silent) emit('update:page', nextPage.value)
}

const addPreviousPage = (silent?: boolean) => {
  if (!previousPage.value) return
  if (pages.value.includes(previousPage.value)) return

  grownTowards = 'top'

  if (pages.value.length >= props.maxPages) {
    const recycledSlotId = slotIds.value.pop()!
    pages.value.pop()
    pages.value.unshift(previousPage.value)
    slotIds.value.unshift(recycledSlotId)
  } else {
    pages.value.unshift(previousPage.value)
    slotIds.value.unshift(++slotIdCounter)
  }

  if (!silent) emit('update:page', previousPage.value)
}

let resizeObserver: ResizeObserver | null = null
const pageHeights = reactive(new Map<number, number>())
/** Where each page starts within the items, to tell whether the page in view moved. */
const pageOffsets = new Map<number, number>()

// Per item rather than per page: the last page can be short, and counted as a full one it would shrink every page.
const avgItemHeight = computed(() => {
  let sum = 0
  let itemCount = 0
  for (let i = 0; i < slotIds.value.length; i++) {
    const h = pageHeights.get(slotIds.value[i]!)
    const page = pages.value[i]
    if (!h || h <= 0 || page === undefined) continue
    sum += h
    itemCount += getPageItemCount(page)
  }
  return itemCount === 0 ? 0 : sum / itemCount
})

const avgPageHeight = computed(() => Math.round(avgItemHeight.value * pageSize.value))

const topSpacerHeight = computed(() => {
  if (!avgPageHeight.value) return 0
  const firstRendered = pages.value[0] ?? 1
  return Math.max(0, (firstRendered - 1) * avgPageHeight.value)
})

// Only the items left after the rendered pages, so a short last page is not reserved as a full one.
const bottomSpacerHeight = computed(() => {
  if (!avgItemHeight.value) return 0
  const lastRendered = pages.value[pages.value.length - 1] ?? 1
  let itemCount = 0
  for (let page = lastRendered + 1; page <= pagesCount.value; page++) itemCount += getPageItemCount(page)
  return Math.round(itemCount * avgItemHeight.value)
})

const columnCount = ref(1)

const getColumnCount = (element: HTMLElement): number => {
  const style = getComputedStyle(element)
  if (style.display !== 'grid' && style.display !== 'inline-grid') return 1

  // A grid's computed columns are the resolved track sizes, one length per column.
  return Math.max(style.gridTemplateColumns.match(/[\d.]+px/g)?.length ?? 1, 1)
}

/**
 * Empty cells before the first rendered item, as many as the column it has in the whole list. Without them, a list
 * starting past the first page, or one dropping a page at the top, would move every item to another column whenever
 * the page size is not a multiple of the column count.
 */
const columnOffset = computed(() => {
  if (columnCount.value <= 1) return 0

  return (((pages.value[0] ?? 1) - 1) * pageSize.value) % columnCount.value
})

const getScrollElementTop = (element: Element): number => {
  if (element === document.scrollingElement || element === document.body || element === document.documentElement) return 0
  return element.getBoundingClientRect().top
}

/**
 * The pages render no element of their own, so the items of all pages share one layout, and a grid row can hold the
 * end of one page and the start of the next. A page spans from its first element to the first element of the next
 * page, the last one to the end of the items, so the heights add up to the list's height.
 *
 * With `correctScroll`, the list scrolls by as much as the first page in view moved within the items, so the items in
 * view stay in place when the pages above them change their height. Moved, not the change of the heights above: a
 * page that takes over or gives up a shared row changes its height while nothing moves. Not when pages are added or
 * removed, which move the pages after them by design.
 */
const measurePages = (correctScroll: boolean) => {
  const itemsEl = itemsRef.value
  if (!itemsEl) return

  columnCount.value = getColumnCount(itemsEl)

  const instances = pageComponentRef.value ?? []
  const tops = pages.value.map(page => instances.find(instance => instance?.pageNumber === page)?.getElements()[0]?.getBoundingClientRect().top)
  const itemsBottom = itemsEl.getBoundingClientRect().bottom

  const itemsTop = itemsEl.getBoundingClientRect().top

  const scrollEl = scrollingElement?.value ?? document.scrollingElement
  const scrollElTop = scrollEl ? getScrollElementTop(scrollEl) : 0
  let totalDelta = 0
  let isInViewFound = false

  for (let i = 0; i < pages.value.length; i++) {
    const slotId = slotIds.value[i]
    const top = tops[i]
    if (slotId === undefined || top === undefined) continue

    const bottom = tops.slice(i + 1).find(value => value !== undefined) ?? itemsBottom
    const offset = Math.round(top - itemsTop)
    const oldOffset = pageOffsets.get(slotId)

    pageHeights.set(slotId, Math.round(bottom - top))
    pageOffsets.set(slotId, offset)

    if (isInViewFound || bottom <= scrollElTop) continue

    isInViewFound = true

    if (correctScroll && i !== 0 && oldOffset !== undefined) totalDelta = offset - oldOffset
  }

  for (const slotId of Array.from(pageHeights.keys())) {
    if (slotIds.value.includes(slotId)) continue

    pageHeights.delete(slotId)
    pageOffsets.delete(slotId)
  }

  if (scrollEl && totalDelta !== 0 && scrollEl.scrollTop !== 0) {
    scrollEl.scrollTop += totalDelta
  }
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => measurePages(true))

  if (itemsRef.value) resizeObserver.observe(itemsRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  pageHeights.clear()
  pageOffsets.clear()
})

// By the ids, as pages are added and removed by changing the array in place.
watch([pageComponentRef, () => slotIds.value.join()], () => measurePages(false), {flush: 'post', immediate: true})

const SENTINEL_MARGIN = 200

let intersectionObserver: IntersectionObserver | null = null
const topSentinelIntersecting = ref(false)
const bottomSentinelIntersecting = ref(false)

const handleIntersection: IntersectionObserverCallback = (entries) => {
  for (const entry of entries) {
    if (entry.target === topSentinelRef.value) {
      topSentinelIntersecting.value = entry.isIntersecting
      if (entry.isIntersecting) addPreviousPage()
    } else if (entry.target === bottomSentinelRef.value) {
      bottomSentinelIntersecting.value = entry.isIntersecting
      if (entry.isIntersecting) addNextPage()
    }
  }
}

onMounted(() => {
  intersectionObserver = new IntersectionObserver(handleIntersection, {
    root: scrollingElement?.value ?? null,
    rootMargin: `${ SENTINEL_MARGIN }px 0px`,
  })

  if (topSentinelRef.value) intersectionObserver.observe(topSentinelRef.value)
  if (bottomSentinelRef.value) intersectionObserver.observe(bottomSentinelRef.value)
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  intersectionObserver = null
})

watch(nextPage, (value, oldValue) => {
  if (oldValue === null && value !== null && bottomSentinelIntersecting.value) addNextPage()
})

const reobserve = (element: HTMLElement | null) => {
  if (!intersectionObserver || !element) return

  intersectionObserver.unobserve(element)
  intersectionObserver.observe(element)
}

// The observer only reports a sentinel entering or leaving the viewport. When an added page is too short to push the
// sentinel back out, or a fast scroll brings it back before the observer runs again, nothing is reported and the
// next page waits for the sentinel to leave and enter again. Observing a sentinel anew reports where it is now, so
// it is done once the pages have rendered. Both while pages can still be added; once pages are recycled, only the
// sentinel the list grew towards, as with fewer pages than fill the viewport it would swap pages back and forth.
watch(pages, () => {
  const towards = grownTowards
  grownTowards = null

  if (pages.value.length < props.maxPages || towards === 'bottom') reobserve(bottomSentinelRef.value)
  if (pages.value.length < props.maxPages || towards === 'top') reobserve(topSentinelRef.value)
}, {deep: true, flush: 'post'})

watch(previousPage, (value, oldValue) => {
  if (oldValue === null && value !== null && topSentinelIntersecting.value) addPreviousPage()
})

const removePage = (page: number): void => {
  const index = pages.value.indexOf(page)

  if (index === -1) return

  pages.value = pages.value.slice(0, index)
  slotIds.value = slotIds.value.slice(0, index)

  if (pagesCount.value >= page) pagesCount.value = page - 1

  emit('update:page', pages.value[pages.value.length - 1])
}

const getPageComponent = (page: number) => pageComponentRef.value?.find(component => component?.pageNumber === page)

const goto = async (page = 1, itemIndex?: number) => {
  if (pages.value.includes(page)) {
    getPageComponent(page)?.scrollTo(itemIndex)

    return
  }

  // Before any page has a height, or past the known pages, there is no place for the page yet, so the list starts over from it.
  if (!avgPageHeight.value || page > pagesCount.value) {
    resetPage(page)

    return
  }

  // Scrolls to where the page will be first, so the sentinels are out of view when the pages change,
  // as they are when the list is scrolled far. Otherwise a sentinel still reported in view adds a page and drops the target.
  scrollToOffset((page - 1) * avgPageHeight.value)

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  jumpToPage(page)

  await nextTick()

  // Far away: a smooth scroll would pass through the spacers and load the pages on the way.
  getPageComponent(page)?.scrollTo(itemIndex, 'instant')
}

const scrollTop = () => {
  const element = scrollingElement?.value ?? document.scrollingElement

  const value = (infiniteScrollRef.value?.$el ? getOffsetTop(infiniteScrollRef.value.$el) : 0) - props.headerHeight - 60

  if (element && element.scrollTop > value) element.scrollTop = value
}

const resetPage = async (page = 1) => {
  emit('update:page', undefined)
  scrollTop()

  const index = pages.value.indexOf(page)
  const recycledSlotId = index !== -1 ? slotIds.value[index] : undefined

  pagesCount.value = 1
  // The count of the previous query would size the skeletons of the new one.
  count.value = 0
  pages.value = [page]
  slotIds.value = [recycledSlotId ?? ++slotIdCounter]
}

const activateInOrder = async (ids: number[], order: number[], gen: number) => {
  for (const idx of order) {
    await nextTick()
    if (gen !== activationGen) return
    const id = ids[idx]
    if (id !== undefined) disabledSlots.delete(id)
  }
}

const jumpToPage = (page: number) => {
  const totalPages = Math.max(1, pagesCount.value)
  const rangeSize = Math.min(props.maxPages, totalPages)

  let start = Math.max(1, page - Math.floor(rangeSize / 2))
  let end = start + rangeSize - 1
  if (end > totalPages) {
    end = totalPages
    start = Math.max(1, end - rangeSize + 1)
  }

  const newPages: number[] = []
  for (let p = start; p <= end; p++) newPages.push(p)

  const newSlotIds: number[] = []
  const existingIds = slotIds.value.slice()
  for (let i = 0; i < newPages.length; i++) {
    newSlotIds.push(existingIds.shift() ?? ++slotIdCounter)
  }

  const foundIdx = newPages.indexOf(page)
  const targetIdx = foundIdx === -1 ? 0 : foundIdx
  const priority: number[] = []
  const seen = new Set<number>()
  const pushIdx = (idx: number) => {
    if (idx < 0 || idx >= newPages.length || seen.has(idx)) return
    priority.push(idx)
    seen.add(idx)
  }
  pushIdx(targetIdx)
  for (let offset = 1; offset < newPages.length; offset++) {
    pushIdx(targetIdx - offset)
    pushIdx(targetIdx + offset)
  }

  disabledSlots.clear()
  for (let i = 0; i < newSlotIds.length; i++) {
    if (i !== targetIdx) disabledSlots.add(newSlotIds[i]!)
  }

  pages.value = newPages
  slotIds.value = newSlotIds

  emit('update:page', page === 1 ? undefined : page)

  activateInOrder(newSlotIds, priority.slice(1), ++activationGen)
}

const anyPageInViewport = (): boolean => {
  const scrollEl = scrollingElement?.value ?? document.scrollingElement
  if (!scrollEl) return true

  const isDocumentScroll = scrollEl === document.scrollingElement || scrollEl === document.body || scrollEl === document.documentElement
  const viewportTop = isDocumentScroll ? 0 : scrollEl.getBoundingClientRect().top
  const viewportBottom = isDocumentScroll ? window.innerHeight : scrollEl.getBoundingClientRect().bottom

  const rect = itemsRef.value?.getBoundingClientRect()
  if (!rect) return true

  return rect.bottom > viewportTop && rect.top < viewportBottom
}

const getScrollPosition = () => {
  const scrollEl = scrollingElement?.value ?? document.scrollingElement
  const containerEl = infiniteScrollRef.value?.$el as HTMLElement | null | undefined
  if (!scrollEl || !containerEl) return null

  const isDocumentScroll = scrollEl === document.scrollingElement || scrollEl === document.body || scrollEl === document.documentElement
  const scrollTop = isDocumentScroll ? window.scrollY : scrollEl.scrollTop
  // Not offsetTop: it is measured from the offsetParent, which is not the scrolling element unless that one is positioned.
  const containerTop = containerEl.getBoundingClientRect().top - getScrollElementTop(scrollEl) + scrollTop

  return {scrollEl, isDocumentScroll, scrollTop, containerTop}
}

/** Scrolls to `y` px from the top of the list. */
const scrollToOffset = (y: number) => {
  const position = getScrollPosition()
  if (!position) return

  const top = position.containerTop + y

  if (position.isDocumentScroll) window.scrollTo({top, behavior: 'instant'})
  else position.scrollEl.scrollTop = top
}

const checkScrollJump = debounce(() => {
  if (isResettingPage.value) return
  if (topSentinelIntersecting.value || bottomSentinelIntersecting.value) return
  if (!avgPageHeight.value) return
  if (anyPageInViewport()) return

  const position = getScrollPosition()
  if (!position) return

  const y = Math.max(0, position.scrollTop - position.containerTop)

  const target = Math.max(1, Math.min(Math.ceil(y / avgPageHeight.value) + 1, pagesCount.value))
  if (pages.value.includes(target)) return

  jumpToPage(target)
}, 300)

if (getIsClientSide()) {
  watch(() => scrollingElement?.value ?? window, (newEl, oldEl) => {
    oldEl?.removeEventListener('scroll', checkScrollJump)
    newEl?.addEventListener('scroll', checkScrollJump, {passive: true})
  }, {immediate: true})
}

onBeforeUnmount(() => {
  const el = scrollingElement?.value ?? window
  el.removeEventListener('scroll', checkScrollJump)
})

let oldQueryParams = {...props.queryParams}

watch(() => props.queryParams, newValue => {
  if (pages.value.length > 1 && isEqualObj(newValue as NonNullable<unknown>, oldQueryParams as NonNullable<unknown>, ['page', ...(props.excludeParams ?? []) as string[]])) return

  resetPage()

  oldQueryParams = {...newValue}
}, {deep: true})

watch(pagesCount, value => {
  if (Math.max(...pages.value) > value) {
    const newPages: number[] = []
    const newSlotIds: number[] = []

    pages.value.forEach((page, index) => {
      if (page <= value) {
        newPages.push(page)
        newSlotIds.push(slotIds.value[index]!)
      }
    })

    if (newPages.length === 0) {
      pages.value = [1]
      slotIds.value = [++slotIdCounter]
    } else {
      pages.value = newPages
      slotIds.value = newSlotIds
    }
  }
}, {immediate: true})

defineExpose({
  resetPage,
  goto,
  isFetching,
  isRefetchingAll,
  refetchAll,
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
    results: Data[] | undefined
    intersecting: boolean
  }) => void
  empty?: () => void
  error?: (props: {error: Error, retry: () => Promise<void>, isFetching: boolean}) => void
}>()
</script>
