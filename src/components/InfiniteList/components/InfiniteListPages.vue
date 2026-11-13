<template>
  <div
    ref="scroll"
    class="w-infinite-list-pages"
    :style="!minHeight && !minHeightOnly ? {minHeight: `calc(var(--w-height-inner) - ${ headerHeight }px)`} : undefined"
    :class="{
      'list:pt-(--w-list-gap,1rem) modal:pb-(--w-list-gap,1rem) modal:min-h-[50vh]': !minHeight && !minHeightOnly,
      'min-h-full': minHeight,
      'list:pt-(--w-list-gap,1rem) modal:pb-(--w-list-gap,1rem)': minHeightOnly,
    }"
  >
    <slot name="before" />

    <!-- Not a scroll anchor: it changes by an average page height when a page is added or dropped at the top, not by the page's own. -->
    <div
      class="[overflow-anchor:none]"
      :style="{height: topSpacerHeight + 'px'}"
    />
    <div ref="topSentinel" />

    <div
      ref="items"
      :class="pageClass"
      :style="pageStyle"
    >
      <!-- Not a scroll anchor: it moves to the start of the first page whenever one is added or dropped at the top. -->
      <div
        v-if="columnOffset"
        aria-hidden="true"
        class="[overflow-anchor:none]"
        :style="{gridColumn: 'span ' + columnOffset, gridRow: leadingRows ? leadingRows + 1 : undefined}"
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
        :page-length="pageLength"
        :enabled="!disabledSlots.has(slotIds[index]!)"

        :value-getter="valueGetter"

        @update:count="count = $event; $emit('update:count', $event)"
        @update:pages-count="updatePagesCount"
        @update:page-size="pageSize = $event"
        @remove:page="removePage"
        @refetch="refetchNextPages(page)"
        @fetched="isResettingPage = false"
        @update:error="$emit('update:error', $event)"
      >
        <template #default="scope">
          <slot
            v-bind="scope"
            :skeleton="scope.skeleton || isRefetchingAll"
            :previous="((scope.previous ?? getPageComponent(page - 1)?.getLast()) as Data | undefined)"
            :next="((scope.next ?? getPageComponent(page + 1)?.getFirst()) as Data | undefined)"
            :resetting="isResettingPage"
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
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {InfiniteListItemScope} from '../types'
import type {ApiError} from '@/utils/api'
import type {DefaultQueryOptions} from '@/utils/useDefaultQuery'

import {type StyleValue, computed, inject, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, useTemplateRef, watch} from 'vue'

import {debounce, getIsClientSide, getOffsetTop, isEqualObj} from '@/utils/utils'

import InfiniteListPage from './InfiniteListPage.vue'

import {wInfiniteListHeaderHeight, wScrollingElement} from '../models/injection'
import {INFINITE_LIST_UNMEASURED_ATTRIBUTE} from '../models/utils'
import {useRefetchNextPages} from '../use/useRefetchNextPages'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
    queryParams: QueryParams
    skeletonLength?: number
    transition?: boolean
    pageLength?: number
    headerHeight?: number
    /** Where the header sticks, from the top of the screen. */
    stickyTop?: number
    minHeight?: boolean
    minHeightOnly?: boolean
    excludeParams?: (keyof QueryParams)[]
    emptyStub?: string
    pageClass?: string
    pageStyle?: StyleValue
    maxPages?: number
    keepColumns?: boolean
    refetchInterval?: number | false
    queryOptions?: DefaultQueryOptions<PaginatedResponse<Data>>

    valueGetter: (data: Data) => Model
  }>(),
  {
    skeletonLength: undefined,
    pageLength: 24,
    headerHeight: 0,
    stickyTop: undefined,
    excludeParams: undefined,
    emptyStub: undefined,
    pageClass: undefined,
    pageStyle: undefined,
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

const scrollRef = useTemplateRef('scroll')

const scrollingElement = inject(wScrollingElement, null)

const getScrollElement = (): Element | null => scrollingElement?.value ?? document.scrollingElement

const getIsDocumentScroll = (element: Element): boolean => element === document.scrollingElement || element === document.body || element === document.documentElement

// Provided rather than set as a variable on the root: a variable there restyles every row when the header is measured.
provide(wInfiniteListHeaderHeight, computed(() => props.headerHeight))

const pages = ref<number[]>([(props.queryParams as {page?: number}).page ?? 1])
let slotIdCounter = 1
const slotIds = ref<number[]>([slotIdCounter])
const pagesCount = ref(1)
const count = ref(0)
/** Items on a full page as the API returns them, which can differ from the `size` the list asks for. */
const pageSize = ref(props.pageLength)
// The pages are always in order and without gaps: pages are added and dropped only at the ends.
const nextPage = computed(() => {
  const last = pages.value.at(-1) ?? 0
  return last < pagesCount.value ? last + 1 : null
})
const previousPage = computed(() => {
  const first = pages.value[0]
  return first !== undefined && first > 1 ? first - 1 : null
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

/**
 * Browsers cap the height of an element, at about 17.9M px in Firefox and 33.5M px in Chrome and Safari, and lay out
 * whatever is past it at the cap. There the sentinels never leave the view, and pages are added one after another.
 */
const MAX_SPACER_HEIGHT = 15_000_000

/** Scales down the space of the pages not rendered when those of a long list would not fit under the cap. */
const spacerScale = computed(() => {
  const height = avgPageHeight.value * pagesCount.value
  return height > MAX_SPACER_HEIGHT ? MAX_SPACER_HEIGHT / height : 1
})

const spacerPageHeight = computed(() => avgPageHeight.value * spacerScale.value)

const topSpacerHeight = computed(() => {
  if (!spacerPageHeight.value) return 0
  const firstRendered = pages.value[0] ?? 1
  return Math.max(0, Math.round((firstRendered - 1) * spacerPageHeight.value))
})

// Only the items left after the rendered pages, so a short last page is not reserved as a full one.
const bottomSpacerHeight = computed(() => {
  if (!avgItemHeight.value) return 0
  const lastRendered = pages.value[pages.value.length - 1] ?? 1
  let itemCount = 0
  for (let page = lastRendered + 1; page <= pagesCount.value; page++) itemCount += getPageItemCount(page)
  return Math.round(itemCount * avgItemHeight.value * spacerScale.value)
})

const columnCount = ref(1)

const getColumnCount = (element: HTMLElement): number => {
  if (!props.keepColumns) return 1

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
const columnOffset = ref(0)

/**
 * The column each page started in when it was last rendered after the pages before it. Items spanning the whole row,
 * such as group headings, end a row early, so the column cannot be told from the count of items before the page.
 */
const pageColumns = new Map<number, number>()

const getGuessedColumnOffset = (page: number): number => {
  if (columnCount.value <= 1) return 0

  return ((page - 1) * pageSize.value) % columnCount.value
}

// Before the first page renders, so the pages after it do not move for a frame when its column is known.
watch(() => pages.value[0], page => {
  columnOffset.value = (page === undefined ? undefined : pageColumns.get(page)) ?? getGuessedColumnOffset(page ?? 1)
})

watch(pageSize, () => pageColumns.clear())

/**
 * Rows the first page opens with, of items spanning the whole row such as the heading of the group it continues. The
 * empty cells go in the row after them, so the cells come before the first item that takes a column.
 */
const leadingRows = ref(0)

const getIsFullRow = (element: Element): boolean => {
  const start = getComputedStyle(element).gridColumnStart

  return start !== 'auto' && !start.startsWith('span')
}

/** The start of each column of the items, from the left of their content. */
const getColumnStarts = (element: HTMLElement): number[] => {
  const style = getComputedStyle(element)
  const gap = Number.parseFloat(style.columnGap) || 0
  let start = element.getBoundingClientRect().left + (Number.parseFloat(style.borderLeftWidth) || 0) + (Number.parseFloat(style.paddingLeft) || 0)

  return (style.gridTemplateColumns.match(/[\d.]+px/g) ?? []).map(value => {
    const current = start
    start += Number.parseFloat(value) + gap
    return current
  })
}

const getColumn = (element: Element, starts: number[]): number => {
  const left = element.getBoundingClientRect().left
  let column = 0

  for (let i = 1; i < starts.length; i++) if (left >= starts[i]! - 1) column = i

  return column
}

/**
 * Keeps the empty cells true to the columns the pages had: the first page after it rendered before keeps its column, so
 * its items do not move. Not the first page's own, which is a guess for a page not rendered before, and changes as its
 * items load, while a page still loading has no group headings to end its rows early. Returns whether the cells
 * changed, after which the pages are measured again.
 */
const updateColumnOffset = (pageElements: Element[][]): boolean => {
  const itemsEl = itemsRef.value
  if (!itemsEl) return false

  // Without the cells the leading rows place nothing.
  if (columnCount.value <= 1) {
    const isChanged = columnOffset.value !== 0
    columnOffset.value = 0
    return isChanged
  }

  const firstElements = pageElements[0] ?? []
  const firstItemIndex = firstElements.findIndex(element => !getIsFullRow(element))
  const newLeadingRows = firstItemIndex === -1 ? 0 : firstItemIndex

  if (firstItemIndex === -1) {
    const isChanged = columnOffset.value !== 0 || leadingRows.value !== newLeadingRows
    columnOffset.value = 0
    leadingRows.value = newLeadingRows
    return isChanged
  }

  if (leadingRows.value !== newLeadingRows) {
    leadingRows.value = newLeadingRows
    return true
  }

  const starts = getColumnStarts(itemsEl)
  const columns = pageElements.map(elements => {
    const item = elements.find(element => !getIsFullRow(element))
    return item ? getColumn(item, starts) : undefined
  })

  // The list starts in the first column.
  if (pages.value[0] === 1) {
    if (columnOffset.value !== 0) {
      columnOffset.value = 0
      return true
    }
  } else if (!firstElements.slice(firstItemIndex).some(getIsFullRow)) {
    // Up to the next item spanning the whole row, which starts the next row whatever the cells.
    for (let i = 1; i < pages.value.length; i++) {
      const elements = pageElements[i] ?? []
      const itemIndex = elements.findIndex(element => !getIsFullRow(element))
      if (itemIndex !== 0) {
        if (elements.length === 0) continue
        break
      }

      const known = pageColumns.get(pages.value[i]!)
      const actual = columns[i]
      if (known !== undefined && actual !== undefined) {
        if (known === actual) break

        columnOffset.value = (columnOffset.value + known - actual + columnCount.value) % columnCount.value
        return true
      }

      if (elements.some(getIsFullRow)) break
    }
  }

  pages.value.forEach((page, index) => {
    const column = columns[index]
    if (column !== undefined) pageColumns.set(page, column)
  })

  return false
}

/** The space the page's unmeasured elements take, with their margins and the row gap each opens in a grid. */
const getUnmeasuredHeight = (elements: Element[], rowGap: number): number => {
  let height = 0

  for (const element of elements) {
    if (!element.hasAttribute(INFINITE_LIST_UNMEASURED_ATTRIBUTE)) continue

    const style = getComputedStyle(element)
    height += element.getBoundingClientRect().height + (Number.parseFloat(style.marginTop) || 0) + (Number.parseFloat(style.marginBottom) || 0) + rowGap
  }

  return height
}

const getScrollElementTop = (element: Element): number => getIsDocumentScroll(element) ? 0 : element.getBoundingClientRect().top

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

  const newColumnCount = getColumnCount(itemsEl)

  if (newColumnCount !== columnCount.value) {
    columnCount.value = newColumnCount
    pageColumns.clear()
    columnOffset.value = getGuessedColumnOffset(pages.value[0] ?? 1)
    nextTick(() => measurePages(correctScroll))
    return
  }

  const pageElements = pages.value.map(page => getPageComponent(page)?.getElements() ?? [])

  // The layout changes with the cells, so the pages are measured once it has rendered.
  if (updateColumnOffset(pageElements)) {
    nextTick(() => measurePages(correctScroll))
    return
  }

  const tops = pageElements.map(elements => elements[0]?.getBoundingClientRect().top)
  const itemsBottom = itemsEl.getBoundingClientRect().bottom
  const rowGap = Number.parseFloat(getComputedStyle(itemsEl).rowGap) || 0

  const itemsTop = itemsEl.getBoundingClientRect().top

  const scrollEl = getScrollElement()
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

    pageHeights.set(slotId, Math.round(bottom - top - getUnmeasuredHeight(pageElements[i]!, rowGap)))
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
let topSentinelIntersecting = false
let bottomSentinelIntersecting = false

const handleIntersection: IntersectionObserverCallback = (entries) => {
  for (const entry of entries) {
    if (entry.target === topSentinelRef.value) {
      topSentinelIntersecting = entry.isIntersecting
      if (entry.isIntersecting) addPreviousPage()
    } else if (entry.target === bottomSentinelRef.value) {
      bottomSentinelIntersecting = entry.isIntersecting
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
  if (oldValue === null && value !== null && bottomSentinelIntersecting) addNextPage()
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
  if (oldValue === null && value !== null && topSentinelIntersecting) addPreviousPage()
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
  scrollToOffset((page - 1) * spacerPageHeight.value)

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  jumpToPage(page)

  await nextTick()

  // Far away: a smooth scroll would pass through the spacers and load the pages on the way.
  getPageComponent(page)?.scrollTo(itemIndex, 'instant')
}

const scrollTop = () => {
  const element = getScrollElement()

  // On the page the list scrolls back to where its first item shows under the stuck header.
  const top = scrollingElement || props.stickyTop === undefined ? 60 : props.stickyTop
  const value = (scrollRef.value ? getOffsetTop(scrollRef.value) : 0) - props.headerHeight - top

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
  pageColumns.clear()
  pages.value = [page]
  slotIds.value = [recycledSlotId ?? ++slotIdCounter]
}

/** Enables the queries of the pages one per tick, so the target page is fetched first and those nearest it next. */
const activateInOrder = async (ids: number[], gen: number) => {
  for (const id of ids) {
    await nextTick()
    if (gen !== activationGen) return
    disabledSlots.delete(id)
  }
}

/** The queries of the pages jumped to while scrolling, enabled once the scroll settles. */
let pendingActivation: {ids: number[], gen: number} | null = null

/**
 * With `whileScrolling`, the pages render as skeletons right away and are fetched once the scroll settles, so a fast
 * scroll does not fetch every page it passes.
 */
const jumpToPage = (page: number, whileScrolling = false) => {
  const totalPages = Math.max(1, pagesCount.value)
  const rangeSize = Math.min(props.maxPages, totalPages)

  let start = Math.max(1, page - Math.floor(rangeSize / 2))
  let end = start + rangeSize - 1
  if (end > totalPages) {
    end = totalPages
    start = Math.max(1, end - rangeSize + 1)
  }

  const newPages: number[] = []
  const newSlotIds: number[] = []
  for (let p = start; p <= end; p++) {
    newPages.push(p)
    newSlotIds.push(slotIds.value[p - start] ?? ++slotIdCounter)
  }

  const foundIdx = newPages.indexOf(page)
  const targetIdx = foundIdx === -1 ? 0 : foundIdx

  // The target, then the pages around it, nearest first.
  const order: number[] = [newSlotIds[targetIdx]!]
  for (let offset = 1; offset < newPages.length; offset++) {
    if (targetIdx - offset >= 0) order.push(newSlotIds[targetIdx - offset]!)
    if (targetIdx + offset < newPages.length) order.push(newSlotIds[targetIdx + offset]!)
  }

  const deferred = whileScrolling ? order : order.slice(1)

  disabledSlots.clear()
  for (const id of deferred) disabledSlots.add(id)

  pages.value = newPages
  slotIds.value = newSlotIds

  emit('update:page', page === 1 ? undefined : page)

  const gen = ++activationGen

  if (whileScrolling) {
    pendingActivation = {ids: deferred, gen}
  } else {
    pendingActivation = null
    activateInOrder(deferred, gen)
  }
}

const activatePending = () => {
  if (!pendingActivation) return

  const {ids, gen} = pendingActivation
  pendingActivation = null

  if (gen === activationGen) activateInOrder(ids, gen)
}

const anyPageInViewport = (): boolean => {
  const scrollEl = getScrollElement()
  if (!scrollEl) return true

  const isDocumentScroll = getIsDocumentScroll(scrollEl)
  const viewportTop = isDocumentScroll ? 0 : scrollEl.getBoundingClientRect().top
  const viewportBottom = isDocumentScroll ? window.innerHeight : scrollEl.getBoundingClientRect().bottom

  const rect = itemsRef.value?.getBoundingClientRect()
  if (!rect) return true

  return rect.bottom > viewportTop && rect.top < viewportBottom
}

const getScrollPosition = () => {
  const scrollEl = getScrollElement()
  const containerEl = scrollRef.value
  if (!scrollEl || !containerEl) return null

  const isDocumentScroll = getIsDocumentScroll(scrollEl)
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

const checkScrollJump = (whileScrolling: boolean) => {
  if (isResettingPage.value) return
  if (topSentinelIntersecting || bottomSentinelIntersecting) return
  if (!avgPageHeight.value) return
  if (anyPageInViewport()) return

  const position = getScrollPosition()
  if (!position) return

  const y = Math.max(0, position.scrollTop - position.containerTop)

  const target = Math.max(1, Math.min(Math.ceil(y / spacerPageHeight.value) + 1, pagesCount.value))
  if (pages.value.includes(target)) return

  jumpToPage(target, whileScrolling)
}

const SCROLL_SETTLE_DELAY = 150

const handleScrollSettle = debounce(() => {
  checkScrollJump(false)
  activatePending()
}, SCROLL_SETTLE_DELAY)

let scrollFrame: number | null = null

// Every frame rather than once the scroll stops: a trackpad's momentum keeps scrolling for seconds, showing only the spacers meanwhile.
const handleScroll = () => {
  handleScrollSettle()

  if (scrollFrame !== null) return

  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null
    checkScrollJump(true)
  })
}

if (getIsClientSide()) {
  watch(() => scrollingElement?.value ?? window, (newEl, oldEl) => {
    oldEl?.removeEventListener('scroll', handleScroll)
    newEl?.addEventListener('scroll', handleScroll, {passive: true})
  }, {immediate: true})
}

onBeforeUnmount(() => {
  const el = scrollingElement?.value ?? window
  el.removeEventListener('scroll', handleScroll)
  if (scrollFrame !== null) cancelAnimationFrame(scrollFrame)
})

let oldQueryParams = {...props.queryParams}

watch(() => props.queryParams, newValue => {
  if (pages.value.length > 1 && isEqualObj(newValue as NonNullable<unknown>, oldQueryParams as NonNullable<unknown>, ['page', ...(props.excludeParams ?? []) as string[]])) return

  resetPage()

  oldQueryParams = {...newValue}
}, {deep: true})

// Drops the pages past the last one.
watch(pagesCount, value => {
  const end = pages.value.findIndex(page => page > value)
  if (end === -1) return

  if (end === 0) {
    pages.value = [1]
    slotIds.value = [++slotIdCounter]
  } else {
    pages.value = pages.value.slice(0, end)
    slotIds.value = slotIds.value.slice(0, end)
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
  default?: (props: InfiniteListItemScope<Data, Model>) => void
  before?: () => void
  empty?: () => void
  error?: (props: {error: Error, retry: () => Promise<void>, isFetching: boolean}) => void
}>()
</script>
