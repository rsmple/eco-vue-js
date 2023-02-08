<template>
  <div
    ref="indicator"
    class="relative"
  >
    <div
      ref="target"
      class="absolute -h--header-height w-full bottom-0 pointer-events-none"
    />
  </div>

  <div
    ref="header"
    class="z-20 sticky top-[var(--header-height)]"
  >
    <div
      v-for="(slot, index) in $slots.header?.()"
      :key="index"
      class="flex w-[calc(100vw-var(--nav-bar-width)-var(--inner-margin))]"
    >
      <component
        :is="slot"
        class="w-[calc(100vw-var(--inner-width-diff))]"
      />

      <div class="pr-[calc(var(--actions-bar-width)+var(--inner-margin))]" />
    </div>
  </div>

  <InfiniteListScroll
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
      :is-enabled="isEnabled"
      :content-component="pageContentComponent"
      :key-getter="keyGetter"
      :skeleton-length="skeletonLength ? skeletonLength > ((page - 1) * 24) ? Math.min(skeletonLength - ((page - 1) * 24), 24) : 24 : undefined"
      :first-page="index === 0"
      :last-page="index === pages.length - 1"
      :hide-page-title="hidePageTitle"
      :page-label-with-margin="pageLabelWithMargin"
      :style="{'--infinite-list-header-height': headerHeight + 'px'}"
      class="min-h-[calc(100vh-var(--header-height)-var(--infinite-list-header-height))] last:pb-16"
      @update:count="updateCount"
      @update:pages-count="updatePagesCount"
      @update:next-page="updateNextPage"
      @update:previous-page="updatePreviousPage"
      @update:scroll="updateScroll"
      @error:invalid-page="removePage"
      @refetch="refetchNextPages(index)"
      @update-from-header:scroll="headerTop > 0 && updateScroll(headerTop)"
    >
      <template #default="{item, setter, skeleton, refetch}">
        <slot
          :item="item"
          :setter="setter"
          :skeleton="skeleton"
          :refetch="refetch"
        />
      </template>
    </InfiniteListPage>

    <InfiniteListButton
      v-if="count !== 0 && nextPage"
      @click="addNextPage"
    />
  </InfiniteListScroll>
</template>

<script lang="ts" setup>
import {ref, computed, watch, toRef, nextTick} from 'vue'
import {useRoute, useRouter, type LocationQueryRaw} from 'vue-router'
import InfiniteListScroll from './components/InfiniteListScroll.vue'
import InfiniteListPage from './components/InfiniteListPage.vue'
import type {QueryParams, UseDefaultQueryFn} from './models/types'
import {useRefetchNextPages} from './use/useRefetchNextPages'
import {useInfiniteListHeader} from './use/useInfiniteListHeader'
import InfiniteListButton from './components/InfiniteListButton.vue'
import {isEqualObj} from '@/utils/utils'

const MAX_PAGES = 5

const props = withDefaults(
  defineProps<{
    useQueryFn: UseDefaultQueryFn
    isInvalidPage: (error: unknown) => boolean
    isEnabled?: boolean
    pageContentComponent?: VueComponent
    keyGetter?: (data: unknown, index: number) => string | number
    parseQuery?: (query: LocationQueryRaw) => QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    headerMargin?: number
    pageLabelWithMargin?: boolean
  }>(),
  {
    isEnabled: true,
    pageContentComponent: undefined,
    keyGetter: undefined,
    parseQuery: undefined,
    skeletonLength: 24,
    headerMargin: 0,
  },
)

const emit = defineEmits<{
  (e: 'update:header-padding', value: number): void
}>()

const route = useRoute()
const router = useRouter()

const queryParams = computed<QueryParams>(() => props.parseQuery ? props.parseQuery(route.query) : (route.query as QueryParams))
const queryParamsStrict = computed(() => {
  const params: Omit<QueryParams, 'page'> = {...queryParams.value}

  delete params.page

  return params
})

const pages = ref<number[]>([queryParams.value.page ?? 1])
const pagesCount = ref(1)
const count = ref(0)
const nextPage = ref<number | null>()
const previousPage = ref<number | null>()
const target = ref<HTMLDivElement | undefined>()

const isPreviousButtonVisible = computed<boolean>(() => {
  if (pages.value.length === 1 && pages.value[0] > 1) return true
  if (count.value === 0) return false
  if (previousPage.value) return true

  return false
})

const updateHeaderPadding = (value: number): void => {
  emit('update:header-padding', value)
}

const {indicator, header, headerTop, headerHeight} = useInfiniteListHeader(toRef(props, 'headerMargin'), updateHeaderPadding)
const {pageComponent, refetchNextPages} = useRefetchNextPages()

const updateCount = (value: number): void => {
  count.value = value
}

const updatePagesCount = (value: number): void => {
  pagesCount.value = value
}

const updateNextPage = (value: number | null): void => {
  nextPage.value = value
}

const updatePreviousPage = (value: number | null): void => {
  previousPage.value = value

  if (pages.value.length === 1) {
    addPreviousPage({updateQuery: false})
  }
}

const addNextPage = () => {
  if (!nextPage.value) return
  if (pages.value.includes(nextPage.value)) return

  pages.value.push(nextPage.value)

  updateQueryParams({page: nextPage.value})

  if (pages.value.length < MAX_PAGES) return

  const firstPage = pages.value.shift()

  if (firstPage === undefined) return

  previousPage.value = firstPage
}

const addPreviousPage = (options: {updateQuery?: boolean} = {}) => {
  if (!previousPage.value) return
  if (pages.value.includes(previousPage.value)) return

  pages.value.unshift(previousPage.value)

  if (options.updateQuery !== false) updateQueryParams({page: previousPage.value})

  if (pages.value.length < MAX_PAGES) return

  const lastPage = pages.value.pop()

  if (lastPage === undefined) return

  nextPage.value = lastPage
}

const updateScroll = (height: number): void => {
  const element = document.scrollingElement

  if (!element) return

  element.scrollTop = element.scrollTop + height
}

const removePage = (page: number): void => {
  const index = pages.value.indexOf(page)

  if (index === -1) return

  pages.value.splice(index, pages.value.length - index)

  if (!pages.value.length) pages.value = [1]

  updateQueryParams({page: pages.value[pages.value.length - 1]})
}

const updateQueryParams = (queryParams: QueryParams): void => {
  router.replace({hash: route.hash, query: {...route.query, ...queryParams}})
}

const resetPage = async () => {
  const isRefetch = pages.value.includes(1)

  updateQueryParams({page: undefined} as unknown as QueryParams)
  pages.value = [1]
  nextPage.value = null
  previousPage.value = null

  if (target.value) target.value.scrollIntoView({block: 'start'})

  await nextTick()

  if (isRefetch) pageComponent.value[0]?.refetch()
}

watch(queryParamsStrict, (newValue, oldValue) => {
  if (isEqualObj(newValue, oldValue)) return

  resetPage()
})

defineExpose({
  resetPage,
})

</script>
