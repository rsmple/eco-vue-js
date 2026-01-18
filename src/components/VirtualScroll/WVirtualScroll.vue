<template>
  <div class="bg-default dark:bg-default-dark -w--width-inner -top--header-height fixed z-[100] flex flex-wrap gap-1 py-2 text-xs opacity-10 hover:opacity-100">
    <div class="code-inline">
      pageCount: {{ pageCount }}
    </div>
    <div class="code-inline">
      pageItemsHeight: {{ pageItemsHeight }}
    </div>
    <div class="code-inline">
      averagePageHeight: {{ averagePageHeight }}
    </div>
    <div class="code-inline">
      height: {{ height }}
    </div>
    <div class="code-inline">
      virtualPageCount: {{ virtualPageCount }}
    </div>
    <div class="code-inline">
      pageCount: {{ pageCount }}
    </div>
    <div class="code-inline">
      pagesTop: {{ pagesTop.length }}
    </div>
    <div class="code-inline">
      scrollTop: {{ scrollTop }}
    </div>
    <div class="code-inline">
      visiblePage: {{ startPage }} - {{ visiblePage }} - {{ endPage }}
    </div>
    <div class="code-inline">
      pagesOnScreen: {{ pagesOnScreen }}
    </div>
    <div class="code-inline">
      virtualPageMap: {{ Array(virtualPageCount).fill(null).map((_, index) => virtualPageMap[index + 1]) }}
    </div>
  </div>

  <component
    :is="minHeight ? WEmptyComponent : WInfiniteListWrapper"
    :init-is-intersecting="visiblePage !== 1 ? false : undefined"
    :no-header-update="noHeaderUpdate"
  >
    <template #header="headerScope">
      <slot
        name="header"
        v-bind="{isFetching, isRefetchingAll, refetchAll, ...headerScope}"
      />
    </template>

    <template #default="defaultScope">
      <div
        ref="container"
        v-bind="$attrs"
        :style="{
          height: `${height}px`,
          '--infinite-list-header-height': defaultScope && 'headerHeight' in defaultScope ? defaultScope.headerHeight + 'px' : undefined
        }"
        :class="{
          '-min-h--height-inner list:pt-[--w-list-gap,1rem] pb-16': !minHeight,
          'min-h-full': minHeight,
        }"
        class="relative"
      >
        <template
          v-for="index in virtualPageCount"
          :key="index"
        >
          <VirtualScrollPage
            ref="page"
            :virtual-index="index"
            :use-query-fn="useQueryFn"
            :query-params="queryParams"
            :query-options="queryOptions"
            :page="virtualPageMap[index] ?? null"
            :initial-page-height="averagePageHeight"
            :skeleton-length="getSkeletonLength(virtualPageMap[index] ?? 0)"
            :empty-stub="emptyStub"
            :style="{
              transform: `translateY(${ !virtualPageMap[index] ? '-9999' : pagesTop[virtualPageMap[index] - 1] }px)`,
            }"
            :class="pageClass"
            class="absolute left-0 top-0"
            @update:page-count="pageCount = $event"
            @update:count="countValue = $event; $emit('update:count', $event)"
            @update:page-height="updatePagesTop(virtualPageMap[index] ?? null)"
            @refetch="refetchNextPages(virtualPageMap[index] ?? 0)"
          >
            <template #default="scope">
              <slot v-bind="scope" />
            </template>

            <template
              v-if="$slots.empty"
              #empty
            >
              <slot name="empty" />
            </template>
          </VirtualScrollPage>
        </template>

        <div
          v-for="page in pageCount"
          :key="page"
          class="-w--width-inner absolute left-0 top-0 z-[1] border-t border-gray-300 bg-gray-200/20 py-1 text-center text-xs text-gray-500"
          :style="{
            transform: `translateY(${ pagesTop[page - 1] }px)`,
          }"
        >
          {{ page }}: {{ pagesTop[page - 1] ?? 0 }}
        </div>
      </div>
    </template>
  </component>
</template>

<script setup lang="ts" generic="Data extends {id: string | number}, QueryParams">
import type {ApiError} from '@/utils/api'

import {computed, inject, onUnmounted, ref, useTemplateRef, watch} from 'vue'

import {debounce} from '@/utils/utils'

import VirtualScrollPage from './components/VirtualScrollPage.vue'

import WEmptyComponent from '../EmptyComponent/WEmptyComponent.vue'
import WInfiniteListWrapper from '../InfiniteList/WInfiniteListWrapper.vue'
import {wScrollingElement} from '../InfiniteList/models/injection'
import {useRefetchNextPages} from '../InfiniteList/use/useRefetchNextPages'

const PAGE_LENGTH_DEFAULT = 24

const props = defineProps<{
  useQueryFn: UseQueryWithParams<PaginatedResponse<Data>, QueryParams>
  queryParams: QueryParams
  queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>
  count: number
  noHeaderUpdate?: boolean
  minHeight?: boolean
  emptyStub?: string
  pageClass?: string
}>()

defineEmits<{
  (e: 'update:count', value: number): void
  (e: 'update:error', value: ApiError): void
}>()

const scrollingElement = inject(wScrollingElement, null)

const getScrollingElement = () => scrollingElement?.value ?? document.scrollingElement

const virtualPageCount = ref<number>(5)
const virtualPageMap = ref<Record<number, number>>({1: 1})
const virtualPageMapReverse = ref<Record<number, number>>({1: 1})

const pageRef = useTemplateRef<ComponentInstance<typeof VirtualScrollPage>[]>('page')

const pageCount = ref(Math.ceil(props.count / PAGE_LENGTH_DEFAULT))
const countValue = ref(props.count)

const {isFetching, isRefetchingAll, refetchNextPages, refetchAll} = useRefetchNextPages(pageRef)

const getSkeletonLength = (page: number) => {
  if (page !== pageCount.value) return PAGE_LENGTH_DEFAULT

  return (countValue.value % PAGE_LENGTH_DEFAULT) || PAGE_LENGTH_DEFAULT
}

const pageItemsHeight = computed(() => Math.ceil((pageRef.value?.reduce((sum, page) => sum + (page?.pageHeight ?? 0), 0) ?? 0) / 100) * 100)

const containerRef = useTemplateRef<HTMLDivElement>('container')

const averagePageHeight = ref<number>(containerRef.value?.offsetHeight ?? 0)
const scrollTop = ref(0)

let lastLess = 0
let timeout: NodeJS.Timeout | null = null

const updateAveragePageHeight = () => {
  if (timeout) clearTimeout(timeout)

  if (!pageItemsHeight.value || !pageRef.value?.length) {
    averagePageHeight.value = containerRef.value?.offsetHeight ?? 0
    return
  }

  if (!averagePageHeight.value) {
    averagePageHeight.value = Math.ceil((pageItemsHeight.value + averagePageHeight.value) / (pageRef.value.length + 1) / 100) * 100
    return
  }

  timeout = setTimeout(() => {
    timeout = null
    const newValue = Math.ceil((pageItemsHeight.value + averagePageHeight.value) / ((pageRef.value?.length ?? 0) + 1) / 100) * 100
    if (newValue < averagePageHeight.value && lastLess < 3) {
      // Skip few times to avoid jitter
      lastLess++
      return
    }
    averagePageHeight.value = newValue
    lastLess = 0
  }, 1000)
}

watch(pageItemsHeight, updateAveragePageHeight, {immediate: true})

// Last measured total height
const pagesTop = ref<number[]>([0])

const updatePagesTop = (start: number | null) => {
  if (start === null) return

  const tops: number[] = []
  let currentTop = pagesTop.value[start - 1] ?? 0

  for (let page = start; page <= pageCount.value; page++) {
    const index = virtualPageMapReverse.value[page]
    const pageInstance = index !== undefined ? pageRef.value?.[index - 1] : undefined
    const pageHeight = pageInstance?.pageHeight
      ?? (pagesTop.value[page] ? pagesTop.value[page] - pagesTop.value[page - 1] : averagePageHeight.value)

    tops.push(currentTop)
    currentTop += pageHeight
  }

  tops.push(currentTop) // Add final bottom

  let page = visiblePage.value + 1
  if (scrollTop.value - pagesTop.value[page + 1] < scrollTop.value - pagesTop.value[page]) page += 1 // Closer to next page
  const scrollElement = getScrollingElement()
  if (scrollElement && page > 3 && page >= start) {
    const oldValue = pagesTop.value[page]
    const newValue = tops[page - start - 1]
    if (oldValue !== undefined && newValue !== undefined) {
      const diff = pagesTop.value[page - 2] - tops[page - start - 1]
      if (diff !== 0) {
        requestAnimationFrame(() => {
          scrollElement.scrollTop -= diff
        })
      }
    }
  }

  pagesTop.value.splice(start - 1, tops.length, ...tops)
}

const SCAN_LIMIT = 5
let lastPage = 1

const visiblePage = ref(1)

const getVisiblePage = () => {
  const tops = pagesTop.value
  const scroll = scrollTop.value
  let page = lastPage

  // Try quick directional scan
  for (let i = 0; i < SCAN_LIMIT; i++) {
    if (page < pageCount.value && scroll >= tops[page]) page++
    else if (page > 1 && scroll < tops[page - 1]) page--
    else {
      lastPage = page
      return page
    }
  }

  // If not resolved → jump to binary search
  let left = 1
  let right = pageCount.value
  while (left < right) {
    const mid = (left + right) >> 1
    if (scroll < tops[mid]) right = mid
    else left = mid + 1
  }

  lastPage = left
  return left
}

const pagesOnScreen = computed(() => {
  if (averagePageHeight.value === 0) return 1

  return Math.min(Math.ceil(window.innerHeight / averagePageHeight.value) + 1, 10)
})

const startPage = computed(() => Math.max(1, visiblePage.value - Math.ceil(pagesOnScreen.value / 2)))
const endPage = computed(() => Math.min(pageCount.value, visiblePage.value + Math.ceil(pagesOnScreen.value * 1.5)))

const updateVirtualPageMap = debounce(() => {
  const newMap: Record<number, number> = {}
  const newMapReverse: Record<number, number> = {}
  const availableVirtualPages = Array.from({length: virtualPageCount.value}, (_, i) => i + 1)

  for (const virtualPage in virtualPageMap.value) {
    const page = virtualPageMap.value[virtualPage]

    if (page >= startPage.value && page <= endPage.value) {
      newMap[Number(virtualPage)] = page
      newMapReverse[page] = Number(virtualPage)

      const index = availableVirtualPages.indexOf(Number(virtualPage))
      if (index !== -1) availableVirtualPages.splice(index, 1)
    }
  }

  const newPages = []
  for (let page = startPage.value; page <= endPage.value; page++) {
    if (!(page in newMapReverse)) newPages.push(page)
  }

  let virtualIndex = virtualPageCount.value

  for (const page of newPages) {
    const virtualPage = availableVirtualPages.shift() ?? ++virtualIndex
    newMap[virtualPage] = page
    newMapReverse[page] = virtualPage
  }

  if (virtualIndex > virtualPageCount.value) virtualPageCount.value = virtualIndex
  virtualPageMap.value = newMap
  virtualPageMapReverse.value = newMapReverse
}, 500)

const height = computed(() => pagesTop.value[pageCount.value] ?? 0)

watch([startPage, endPage], updateVirtualPageMap, {immediate: true})

const handleScroll = () => {
  const scrollElement = getScrollingElement()
  if (!containerRef.value || !scrollElement) return

  const newValue = scrollElement.scrollTop - containerRef.value.offsetTop
  scrollTop.value = newValue

  visiblePage.value = getVisiblePage()
}

const resetScroll = () => {
  const scrollElement = getScrollingElement()
  if (!containerRef.value || !scrollElement) return

  scrollElement.scrollTop = containerRef.value.offsetTop
  scrollTop.value = 0
  visiblePage.value = 1
  virtualPageMap.value = {1: 1}
  virtualPageMapReverse.value = {1: 1}
  pagesTop.value = [0]
}

watch(() => props.queryParams, resetScroll)

watch(() => props.count, newValue => {
  if (newValue === countValue.value) return
  countValue.value = newValue
  pageCount.value = Math.ceil(newValue / PAGE_LENGTH_DEFAULT)
})

watch(containerRef, (newValue, oldValue) => {
  oldValue?.removeEventListener('scroll', handleScroll)
  newValue?.addEventListener('scroll', handleScroll, {passive: true})
  if (oldValue) resetScroll()
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('scroll', handleScroll)
})
</script>