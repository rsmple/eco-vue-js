<template>
  <InfiniteListScroll
    ref="infiniteScroll"
    :style="{'--infinite-list-header-height': headerHeight + 'px'}"
    :class="{
      '-min-h--height-inner list:pt-[--w-list-gap,1rem] modal:pb-[--w-list-gap,1rem] modal:min-h-[50vh] pb-16': !minHeight,
      'min-h-full': minHeight,
    }"
  >
    <div :style="{height: topSpacerHeight + 'px'}" />
    <div ref="topSentinel" />

    <InfiniteListPage
      v-for="(page, index) in pages"
      ref="pageComponent"
      :key="slotIds[index]"
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
      :query-options="queryOptions"
      :enabled="!disabledSlots.has(slotIds[index]!)"

      :value-getter="valueGetter"

      @update:count="updateCount($event); $emit('update:count', $event)"
      @update:pages-count="updatePagesCount"
      @update:scroll="updateScroll"
      @update-from-header:scroll="headerTop > 0 && nextTick(() => updateScroll(headerTop))"
      @remove:page="removePage"
      @refetch="refetchNextPages(index)"
      @fetched="isResettingPage = false"
      @update:error="$emit('update:error', $event)"
    >
      <template #default="{item, setter, skeleton, refetch, previous, next, first, last, page: itemPage, index: itemIndex, results, intersecting}">
        <slot
          :item="(item as Data)"
          :setter="setter"
          :skeleton="skeleton || isRefetchingAll"
          :refetch="refetch"
          :previous="((previous ?? pageComponentRef?.[index - 1]?.getLast() ?? pageComponentRef?.[pageComponentRef.length - 1]?.getLast()) as Data | undefined)"
          :next="((next ?? pageComponentRef?.[index + 1]?.getFirst() ?? pageComponentRef?.[0]?.getFirst()) as Data | undefined)"
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
    </InfiniteListPage>

    <div ref="bottomSentinel" />
    <div :style="{height: bottomSpacerHeight + 'px'}" />
  </InfiniteListScroll>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {ApiError} from '@/utils/api'

import {computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRef, useTemplateRef, watch} from 'vue'

import {debounce, isEqualObj} from '@/utils/utils'

import InfiniteListPage from './InfiniteListPage.vue'
import InfiniteListScroll from './InfiniteListScroll.vue'

import {wScrollingElement} from '../models/injection'
import {useRefetchNextPages} from '../use/useRefetchNextPages'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    transition?: boolean
    pageLength?: number
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

const scrollingElement = inject(wScrollingElement, null)

const pages = ref<number[]>([(props.queryParams as {page?: number}).page ?? 1])
let slotIdCounter = 1
const slotIds = ref<number[]>([slotIdCounter])
const pagesCount = ref(1)
const count = ref(0)
const nextPage = computed(() => {
  const max = Math.max(...pages.value)
  return max < pagesCount.value ? max + 1 : null
})
const previousPage = computed(() => {
  const min = Math.min(...pages.value)
  return min > 1 ? min - 1 : null
})
const isResettingPage = ref(false)

const disabledSlots = reactive(new Set<number>())
let activationGen = 0

const getSkeletonLength = (pagesBefore: number): number => {
  if (props.skeletonLength === undefined) return props.pageLength

  const length = Math.min(props.skeletonLength - (pagesBefore * props.pageLength), props.pageLength)

  return length < 0 ? props.pageLength : length
}

const pageComponentRef = useTemplateRef<ComponentInstance<typeof InfiniteListPage>[]>('pageComponent')
const topSentinelRef = useTemplateRef<HTMLDivElement>('topSentinel')
const bottomSentinelRef = useTemplateRef<HTMLDivElement>('bottomSentinel')

const {isFetching, isRefetchingAll, refetchNextPages, refetchAll} = useRefetchNextPages(pageComponentRef)

const updateCount = (value: number): void => {
  count.value = value
}

const updatePagesCount = (value: number): void => {
  pagesCount.value = value
}

const addNextPage = (silent?: boolean) => {
  if (!nextPage.value) return
  if (pages.value.includes(nextPage.value)) return

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

const updateScroll = (height: number): void => {
  const element = scrollingElement?.value ?? document.scrollingElement

  if (!element || element.scrollTop === 0) return

  element.scrollTop = element.scrollTop + height
}

let resizeObserver: ResizeObserver | null = null
const pageHeights = reactive(new Map<number, number>())
const observedElements = new Map<HTMLElement, number>()

const avgPageHeight = computed(() => {
  let sum = 0
  let count = 0
  for (const h of pageHeights.values()) {
    if (h <= 0) continue
    sum += h
    count++
  }
  return count === 0 ? 0 : Math.round(sum / count)
})

const topSpacerHeight = computed(() => {
  if (!avgPageHeight.value) return 0
  const firstRendered = pages.value[0] ?? 1
  return Math.max(0, (firstRendered - 1) * avgPageHeight.value)
})

const bottomSpacerHeight = computed(() => {
  if (!avgPageHeight.value) return 0
  const lastRendered = pages.value[pages.value.length - 1] ?? 1
  return Math.max(0, (pagesCount.value - lastRendered) * avgPageHeight.value)
})

const getScrollElementTop = (element: Element): number => {
  if (element === document.scrollingElement || element === document.body || element === document.documentElement) return 0
  return element.getBoundingClientRect().top
}

const handleResize: ResizeObserverCallback = (entries) => {
  const scrollEl = scrollingElement?.value ?? document.scrollingElement
  if (!scrollEl) return

  const scrollElTop = getScrollElementTop(scrollEl)
  let totalDelta = 0

  for (const entry of entries) {
    const el = entry.target as HTMLElement
    const slotId = observedElements.get(el)
    if (slotId === undefined) continue

    const newHeight = Math.round(entry.contentRect.height)
    const oldHeight = pageHeights.get(slotId)

    pageHeights.set(slotId, newHeight)

    if (oldHeight === undefined || oldHeight === newHeight) continue

    if (el.getBoundingClientRect().bottom <= scrollElTop) {
      totalDelta += newHeight - oldHeight
    }
  }

  if (totalDelta !== 0 && scrollEl.scrollTop !== 0) {
    scrollEl.scrollTop += totalDelta
  }
}

onMounted(() => {
  resizeObserver = new ResizeObserver(handleResize)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  pageHeights.clear()
  observedElements.clear()
})

watch([pageComponentRef, slotIds], () => {
  if (!resizeObserver) return

  const instances = pageComponentRef.value ?? []
  const ids = slotIds.value

  if (instances.length === 0 && ids.length > 0) return

  const currentEls = new Set<HTMLElement>()

  for (let i = 0; i < instances.length; i++) {
    const el = instances[i]?.getElement() ?? null
    if (!el) continue
    currentEls.add(el)

    const slotId = ids[i]
    if (slotId === undefined) continue

    if (!observedElements.has(el)) {
      observedElements.set(el, slotId)
      resizeObserver.observe(el)
    }
  }

  if (currentEls.size === 0) return

  for (const el of Array.from(observedElements.keys())) {
    if (!currentEls.has(el)) {
      const id = observedElements.get(el)!
      resizeObserver.unobserve(el)
      observedElements.delete(el)
      pageHeights.delete(id)
    }
  }
}, {flush: 'post', immediate: true})

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
    rootMargin: '200px 0px',
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

const goto = async (page = 1, itemIndex?: number) => {
  const index = pages.value.indexOf(page)
  if (index !== -1) {
    pageComponentRef.value?.[index]?.scrollTo(itemIndex)

    return
  }

  resetPage(page)
}

const scrollTop = () => {
  const element = scrollingElement?.value ?? document.scrollingElement

  const value = (infiniteScrollRef.value?.$el.offsetTop ?? 0) - props.headerHeight - 60

  if (element && element.scrollTop > value) element.scrollTop = value
}

const resetPage = async (page = 1) => {
  emit('update:page', undefined)
  scrollTop()

  const index = pages.value.indexOf(page)
  const recycledSlotId = index !== -1 ? slotIds.value[index] : undefined

  pagesCount.value = 1
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

  const instances = pageComponentRef.value ?? []
  for (const instance of instances) {
    const el = instance?.getElement() ?? null
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.bottom > viewportTop && rect.top < viewportBottom) return true
  }
  return false
}

const checkScrollJump = debounce(() => {
  if (isResettingPage.value) return
  if (topSentinelIntersecting.value || bottomSentinelIntersecting.value) return
  if (!avgPageHeight.value) return
  if (anyPageInViewport()) return

  const scrollEl = scrollingElement?.value ?? document.scrollingElement
  const containerEl = infiniteScrollRef.value?.$el as HTMLElement | null | undefined
  if (!scrollEl || !containerEl) return

  const isDocumentScroll = scrollEl === document.scrollingElement || scrollEl === document.body || scrollEl === document.documentElement
  const scrollTop = isDocumentScroll ? window.scrollY : scrollEl.scrollTop
  const containerTop = isDocumentScroll ? containerEl.getBoundingClientRect().top + scrollTop : containerEl.offsetTop

  const y = Math.max(0, scrollTop - containerTop)

  const target = Math.max(1, Math.min(Math.ceil(y / avgPageHeight.value) + 1, pagesCount.value))
  if (pages.value.includes(target)) return

  jumpToPage(target)
}, 300)

watch(() => scrollingElement?.value ?? window, (newEl, oldEl) => {
  oldEl?.removeEventListener('scroll', checkScrollJump)
  newEl?.addEventListener('scroll', checkScrollJump, {passive: true})
}, {immediate: true})

onBeforeUnmount(() => {
  const el = scrollingElement?.value ?? window
  el.removeEventListener('scroll', checkScrollJump)
})

let oldQueryParams = {}

watch(toRef(props, 'queryParams'), newValue => {
  if (pages.value.length !== 0 && isEqualObj(newValue, oldQueryParams, ['page', ...(props.excludeParams ?? []) as string[]])) return

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
}>()
</script>
