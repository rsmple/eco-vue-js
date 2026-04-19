<template>
  <div
    ref="element"
    class="relative"
  >
    <template v-if="page && slotList.length !== 0">
      <div
        class="flex"
        :class="{
          'mt-[--w-list-gap,0]': page > 1,
        }"
      >
        <InfiniteListPageTitle
          v-if="!hidePageTitle"
          :query-params="(queryParams as QueryParams)"
          class="pb-4 pt-6"
        />
      </div>

      <div :class="pageClass">
        <component
          :is="transition ? TransitionGroup : WEmptyComponent"
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
            v-for="(slot, slotIndex) in slotList"
            :key="slot.key"
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
                  :item="slot.id !== null && data?.results ? data.results[slotIndex]! : ({id: slot.key * -1} as unknown as Data)"
                  :setter="(newItem?: Data) => setItem(slotIndex, newItem)"
                  :refetch="emitRefetch"
                  :skeleton="slot.id === null"
                  :next="slot.id !== null && data?.results ? data.results[slotIndex + 1] : undefined"
                  :previous="slot.id !== null && data?.results ? data.results[slotIndex - 1] : undefined"
                  :first="firstPage && slotIndex === 0"
                  :last="lastPage && slotIndex === slotList.length - 1"
                  :page="page"
                  :index="slotIndex"
                  :results="data?.results"
                  :intersecting="isIntersecting"
                />
              </component>
            </component>
          </template>
        </component>
      </div>
    </template>

    <slot
      v-else
      name="empty"
    >
      <div class="text-accent sm:-left--left-inner sm:-max-w--width-inner flex justify-center px-8 py-16 text-center font-normal sm:sticky">
        {{ emptyStub }}
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import {type Ref, TransitionGroup, computed, inject, nextTick, onBeforeUnmount, onMounted, ref, toRef, toValue, useTemplateRef, watch} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import {ApiError} from '@/utils/api'

import InfiniteListPageTitle from './InfiniteListPageTitle.vue'

import {wScrollingElement} from '../models/injection'

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
    queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>
    enabled?: boolean

    valueGetter: (data: Data) => Model
  }>(),
  {
    keyGetter: undefined,
    selected: undefined,
    previous: undefined,
    emptyStub: 'Nothing to show',
    pageClass: undefined,
    refetchInterval: undefined,
    queryOptions: undefined,
    enabled: true,
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

const scrollingElement = inject(wScrollingElement, null)

const {data, error, setData, refetch, isFetching} = props.useQueryFn(
  toRef(props, 'queryParams'),
  {
    refetchInterval: props.refetchInterval ? (() => isIntersecting.value ? props.refetchInterval : undefined) : undefined,
    ...props.queryOptions ?? {},
    enabled: computed<boolean>(() => props.enabled && (props.queryOptions && 'enabled' in props.queryOptions ? toValue(props.queryOptions.enabled) as boolean : true)),
  },
)

interface ItemSlot {
  key: number
  id: Model | null
}

let slotKeyCounter = 0
const slotList = ref<ItemSlot[]>([]) as Ref<ItemSlot[]>

const reconcileSlots = () => {
  const results = data.value?.results

  if (results === undefined) {
    const target = props.skeletonLength
    const current = slotList.value

    if (current.length === target && current.every(s => s.id === null)) return

    const newSlots: ItemSlot[] = []
    for (let i = 0; i < target; i++) {
      const existing = current[i]
      newSlots.push({key: existing?.key ?? ++slotKeyCounter, id: null})
    }
    slotList.value = newSlots
    return
  }

  if (results.length === 0) {
    slotList.value = []
    return
  }

  const newIds = new Set<Model>()
  for (const item of results) newIds.add(props.valueGetter(item))

  const keepById = new Map<Model, ItemSlot>()
  const freed: ItemSlot[] = []

  for (const slot of slotList.value) {
    if (slot.id !== null && newIds.has(slot.id)) {
      keepById.set(slot.id, slot)
    } else {
      freed.push({key: slot.key, id: null})
    }
  }

  const isFullReplacement = keepById.size === 0

  const newSlots: ItemSlot[] = []
  let freeIdx = 0
  for (const item of results) {
    const id = props.valueGetter(item)
    const kept = keepById.get(id)
    if (kept) {
      newSlots.push({key: kept.key, id})
    } else if (isFullReplacement && freeIdx < freed.length) {
      newSlots.push({key: freed[freeIdx++]!.key, id})
    } else {
      newSlots.push({key: ++slotKeyCounter, id})
    }
  }

  slotList.value = newSlots
}

watch([data, () => props.skeletonLength], reconcileSlots, {immediate: true})
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

watch(data, value => {
  if (props.firstPage && value?.previous !== undefined) emit('update:previous-page', value.previous)
  if (props.lastPage && value?.next !== undefined) emit('update:next-page', value.next)
  if (value?.pages_count !== undefined) emit('update:pages-count', value.pages_count)
  if (value?.count !== undefined) emit('update:count', value.count)
}, {immediate: true})

const errorStatusList: (number | undefined)[] = [404, 400]

watch(error, error => {
  if (!(error instanceof ApiError)) return

  if (errorStatusList.includes(error.response?.status) && page.value !== null) emit('remove:page', page.value)

  emit('update:error', error)
}, {immediate: true})

watch(isFetching, value => {
  if (!value) return

  emit('fetched')
}, {immediate: true})

let intersectionObserver: IntersectionObserver | undefined

const observerCb = (entries: IntersectionObserverEntry[]) => {
  isIntersecting.value = entries.some(entry => {
    if (entry.target === elementRef.value) {
      return entry.isIntersecting
    }
  })
}

onMounted(() => {
  if (elementRef.value) {
    intersectionObserver = new IntersectionObserver(
      observerCb,
      {
        root: scrollingElement?.value,
        rootMargin: '0px',
        threshold: 0,
      },
    )

    intersectionObserver.observe(elementRef.value)
  }

  if (props.firstPage && props.lastPage && page.value !== 1) {
    nextTick().then(() => emit('update-from-header:scroll'))
  }
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  intersectionObserver = undefined

  if (page.value !== null) emit('remove:page', page.value)
})

defineExpose({
  getElement: (): HTMLElement | null => elementRef.value,
  getFirst,
  getLast,
  refetch: refetchPage,
  scrollTo,
  isFetching,
  pageNumber: page,
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
    results: Data[] | undefined
    intersecting: boolean
  }) => void
  empty?: () => void
}>()
</script>
