<template>
  <div
    ref="element"
    class="relative"
  >
    <template v-if="page && data?.results.length !== 0">
      <div class="mt-[--w-list-gap,0] flex">
        <InfiniteListPageTitle
          v-if="!hidePageTitle"
          :query-params="(queryParams as QueryParams)"
          class="pb-4 pt-6"
        />
      </div>

      <div :class="pageClass">
        <component
          :is="transition ? TransitionGroup : WEmptyComponent"
          v-if="hasData && data?.results"
          v-bind="transition ? {
            'enter-active-class': 'transition-[grid-template-rows] overflow-hidden grid',
            'enter-from-class': 'grid-rows-[0fr]',
            'enter-to-class': 'grid-rows-[1fr]',
            'leave-active-class': 'transition-[grid-template-rows] overflow-hidden grid',
            'leave-from-class': 'grid-rows-[1fr]',
            'leave-to-class': 'grid-rows-[0fr]',
            css: !resetting,
          } : undefined"
        >
          <template
            v-for="(item, index) in data.results"
            :key="valueGetter(item)"
          >
            <component
              :is="transition ? 'div' : WEmptyComponent"
              v-bind="transition ? {class: 'w-full'} : undefined"
            >
              <component 
                :is="transition ? 'div' : WEmptyComponent"
                v-bind="transition ? {class: '[overflow:inherit]'} : undefined"
              >
                <slot
                  :item="item"
                  :setter="(newItem?: Data) => setItem(index, newItem)"
                  :refetch="emitRefetch"
                  :skeleton="false"
                  :next="data?.results[index + 1]"
                  :previous="data?.results[index - 1]"
                  :first="firstPage && index === 0"
                  :last="lastPage && index === data.results.length - 1"
                  :page="page"
                  :index="index"
                />
              </component>
            </component>
          </template>
        </component>

        <template v-else>
          <template
            v-for="index in skeletonLength"
            :key="index"
          >
            <slot
              :item="({id: index} as Data)"
              :setter="(newItem?: Data) => setItem(index, newItem)"
              :refetch="emitRefetch"
              :skeleton="true"
              :next="undefined"
              :previous="undefined"
              :first="firstPage && index === 1"
              :last="lastPage && index === skeletonLength"
              :page="page"
              :index="index - 1"
            />
          </template>
        </template>
      </div>
    </template>

    <div
      v-else
      class="text-accent text-base font-normal"
      :class="{
        'sm:left-inner sm:max-w-inner flex justify-center px-8 py-16 text-center sm:sticky': !minHeight,
        'px-[1.0625rem] pt-4': minHeight,
        'pb-4': minHeight && lastChild,
        'pb-2': minHeight && !lastChild,
      }"
    >
      <div class="py-1.25 sm-not:px-3 cursor-default select-none">
        {{ emptyStub }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import {TransitionGroup, computed, nextTick, onBeforeUnmount, onMounted, ref, toRef, useTemplateRef, watch} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import {ApiError} from '@/utils/api'

import InfiniteListPageTitle from './InfiniteListPageTitle.vue'

const props = withDefaults(
  defineProps<{
    queryParams: QueryParams
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    skeletonLength: number
    firstPage: boolean
    lastPage: boolean
    hidePageTitle?: boolean
    transition?: boolean
    resetting?: boolean
    emptyStub?: string
    minHeight?: boolean
    lastChild?: boolean
    pageClass?: string
    refetchInterval?: number | false
    scrollingElement?: Element | null
    queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>

    valueGetter: (data: Data) => Model
  }>(),
  {
    keyGetter: undefined,
    selected: undefined,
    previous: undefined,
    emptyStub: 'Nothing to show',
    pageClass: undefined,
    refetchInterval: undefined,
    scrollingElement: undefined,
    queryOptions: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:count', value: number): void
  (e: 'update:pages-count', value: number): void
  (e: 'update:next-page', value: number | null): void
  (e: 'update:previous-page', value: number | null): void
  (e: 'update:scroll', value: number): void
  (e: 'remove:page', value: number): void
  (e: 'refetch'): void
  (e: 'update-from-header:scroll'): void
  (e: 'update:selected', values: Model[]): void
  (e: 'fetched'): void
  (e: 'update:error', value: ApiError): void
}>()

const elementRef = useTemplateRef('element')
const resultElement = ref<HTMLDivElement[]>([])
const isIntersecting = ref(false)
const hasData = ref(false)

const {data, error, setData, refetch, isFetching} = props.useQueryFn(
  toRef(props, 'queryParams'),
  {
    ...props.queryOptions ?? {},
    refetchInterval: props.refetchInterval ? computed(() => isIntersecting.value ? props.refetchInterval : undefined) : undefined,
  },
)
const nextPage = computed(() => data.value?.next)
const previousPage = computed(() => data.value?.previous)

const page = computed<number | null>(() => props.queryParams instanceof Object && 'page' in props.queryParams && Number.isInteger(props.queryParams.page) ? (props.queryParams.page as number) : null)

const setItem = (index: number, newItem: Data | undefined) => {
  if (!data.value) return

  const newData: PaginatedResponse<Data> = {
    ...data.value,
    results: [...data.value.results],
  }

  if (newItem) newData.results.splice(index, 1, newItem)
  else newData.results.splice(index, 1)

  setData(newData, {index, newItem})
}

const emitRefetch = () => {
  emit('refetch')
}

const refetchPage = async () => {
  await refetch()

  if (props.lastPage && nextPage.value !== undefined) emit('update:next-page', nextPage.value)
  if (props.firstPage && previousPage.value !== undefined) emit('update:previous-page', previousPage.value)
}

const getFirst = () => {
  if (!data.value) return undefined
  return data.value.results[0]
}

const getLast = () => {
  if (!data.value) return undefined
  return data.value.results[data.value.results.length - 1]
}

const scrollTo = (index?: number) => {
  if (index) {
    if (index !== -1 && resultElement.value[index]) {
      resultElement.value[index].scrollIntoView({block: 'center', behavior: 'smooth'})
      return
    }
  }

  elementRef.value?.scrollIntoView({block: 'center', behavior: 'smooth'})
}

let timeout: NodeJS.Timeout | null = null

watch(data, value => {
  if (props.firstPage && value?.previous !== undefined) emit('update:previous-page', value.previous)
  if (props.lastPage && value?.next !== undefined) emit('update:next-page', value.next)
  if (value?.pages_count !== undefined) emit('update:pages-count', value.pages_count)
  if (value?.count !== undefined) emit('update:count', value.count)

  if (timeout) clearTimeout(timeout)

  if (value === undefined) {
    hasData.value = false
  } else {
    timeout = setTimeout(() => {
      hasData.value = true
      timeout = null
    }, 100)
  }
}, {immediate: true})

const errorStatusList: (number | undefined)[] = [404, 400]

watch(error, error => {
  if (!(error instanceof ApiError)) return

  if (errorStatusList.includes(error.response?.status) && page.value !== null) emit('remove:page', page.value)

  emit('update:error', error)
}, {immediate: true})

watch(isFetching, value => {
  if (value) return

  emit('fetched')
})

let height = 0
let intersectionObserver: IntersectionObserver | undefined

const observerCb = (entries: IntersectionObserverEntry[]) => {
  isIntersecting.value = entries.some(entry => {
    if (entry.target === elementRef.value) {
      return entry.isIntersecting
    }
  })
}

onMounted(() => {
  if (props.refetchInterval && elementRef.value) {
    intersectionObserver = new IntersectionObserver(
      observerCb,
      {
        root: props.scrollingElement ?? null,
        rootMargin: '0px',
        threshold: 0,
      },
    )

    intersectionObserver.observe(elementRef.value)
  }

  height = elementRef.value?.getBoundingClientRect()?.height ?? 0

  if (height === 0) return
  if (!props.firstPage) return
  if (props.lastPage) {
    if (page.value !== 1) nextTick().then(() => emit('update-from-header:scroll'))

    return
  }

  emit('update:scroll', height)
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  intersectionObserver = undefined

  if (page.value !== null) emit('remove:page', page.value)
})

watch(data, async (_, oldValue) => {
  if (oldValue) return

  await nextTick()

  const newHeight = (elementRef.value?.getBoundingClientRect().height ?? 0) - height

  if (newHeight === 0) return
  if (!props.firstPage) return
  if (props.lastPage) return

  emit('update:scroll', newHeight)
})

defineExpose({
  getFirst,
  getLast,
  refetch: refetchPage,
  scrollTo,
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
    page: number
    index: number
  }) => void
}>()
</script>
