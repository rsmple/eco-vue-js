<template>
  <div
    v-if="isFailed"
    ref="state"
    class="w-infinite-list-state sm:left---left-inner sm:max-w---width-inner col-span-full sm:sticky"
  >
    <slot
      name="error"
      :error="error!"
      :retry="refetchPage"
      :is-fetching="isFetching"
    >
      <div class="flex flex-col items-center gap-4 px-8 py-16 text-center">
        <span class="text-accent font-normal">{{ errorMessage }}</span>

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          :loading="isFetching"
          @click="refetchPage"
        >
          {{ getText('retry') }}
        </WButton>
      </div>
    </slot>
  </div>

  <TransitionGroup
    v-else-if="page && slotList.length !== 0 && transition"
    enter-active-class="overflow-hidden opacity-0"
    enter-from-class="grid-rows-[0fr]"
    enter-to-class="grid-rows-[1fr]"
    leave-active-class="overflow-hidden opacity-0"
    leave-from-class="grid-rows-[1fr]"
    leave-to-class="grid-rows-[0fr]"
    :css="!resetting"
  >
    <div
      v-for="(slot, slotIndex) in slotList"
      :key="slot.key"
      class="grid w-full motion-safe:transition-[grid-template-rows] motion-safe:duration-300"
    >
      <div class="[overflow:inherit]">
        <InfiniteListPageItem :ref="item => setItemRef(slot.key, item as ItemInstance | null)">
          <slot v-bind="getItemScope(slot, slotIndex, page)" />
        </InfiniteListPageItem>
      </div>
    </div>
  </TransitionGroup>

  <template v-else-if="page && slotList.length !== 0">
    <InfiniteListPageItem
      v-for="(slot, slotIndex) in slotList"
      :key="slot.key"
      :ref="item => setItemRef(slot.key, item as ItemInstance | null)"
    >
      <slot v-bind="getItemScope(slot, slotIndex, page)" />
    </InfiniteListPageItem>
  </template>

  <div
    v-else
    ref="state"
    class="w-infinite-list-state sm:left---left-inner sm:max-w---width-inner col-span-full sm:sticky"
  >
    <slot name="empty">
      <div class="text-accent flex justify-center px-8 py-16 text-center font-normal">
        {{ emptyStub }}
      </div>
    </slot>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {InfiniteListItemScope} from '../types'
import type {DefaultQueryOptions} from '@/utils/useDefaultQuery'

import {type Ref, computed, inject, onBeforeUnmount, onMounted, ref, toRef, toValue, useTemplateRef, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'
import {ApiError, ApiErrorCancel} from '@/utils/api'
import {getLoadErrorMessage, useHandledQueryError} from '@/utils/queryClient'
import {getText} from '@/utils/texts'
import {getPosition} from '@/utils/useSelected'
import {scrollInParent} from '@/utils/utils'

import InfiniteListPageItem from './InfiniteListPageItem.vue'

import {wScrollingElement} from '../models/injection'

const props = withDefaults(
  defineProps<{
    queryParams: QueryParams
    useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
    skeletonLength: number
    firstPage: boolean
    lastPage: boolean
    transition?: boolean
    resetting?: boolean
    emptyStub?: string
    refetchInterval?: number | false
    queryOptions?: DefaultQueryOptions<PaginatedResponse<Data>>
    enabled?: boolean
    /** Page size the list asks for, for the `position` of an item in the whole list. */
    pageLength: number

    valueGetter: (data: Data) => Model
  }>(),
  {
    emptyStub: 'Nothing to show',
    refetchInterval: undefined,
    queryOptions: undefined,
    enabled: true,
  },
)

const emit = defineEmits<{
  (e: 'update:count', value: number): void
  (e: 'update:pages-count', value: number): void
  (e: 'update:page-size', value: number): void
  (e: 'update:next-page', value: number | null): void
  (e: 'update:previous-page', value: number | null): void
  (e: 'remove:page', value: number): void
  (e: 'refetch'): void
  (e: 'fetched'): void
  (e: 'update:error', value: ApiError): void
}>()

type ItemInstance = ComponentInstance<typeof InfiniteListPageItem>

const stateRef = useTemplateRef<HTMLDivElement>('state')
const isIntersecting = ref(false)

const scrollingElement = inject(wScrollingElement, null)

const {data, error, setItem, removeItem, refetch, isFetching} = props.useQueryFn(
  toRef(() => props.queryParams),
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
      keepById.delete(id)
      newSlots.push({key: kept.key, id})
    } else if (isFullReplacement && freeIdx < freed.length) {
      newSlots.push({key: freed[freeIdx++]!.key, id})
    } else {
      newSlots.push({key: ++slotKeyCounter, id})
    }
  }

  slotList.value = newSlots
}

/** The item of a skeleton slot, the same object for as long as the slot stays a skeleton, so the page re-rendering does not re-render every row. */
const placeholders = new Map<number, Data>()

const getPlaceholder = (key: number): Data => {
  let placeholder = placeholders.get(key)

  if (!placeholder) {
    placeholder = {id: key * -1} as unknown as Data
    placeholders.set(key, placeholder)
  }

  return placeholder
}

watch([data, () => props.skeletonLength], () => {
  reconcileSlots()

  const skeletonKeys = new Set(slotList.value.filter(slot => slot.id === null).map(slot => slot.key))

  for (const key of placeholders.keys()) {
    if (!skeletonKeys.has(key)) placeholders.delete(key)
  }
}, {immediate: true})

const itemRefs = new Map<number, ItemInstance>()

const setItemRef = (key: number, item: ItemInstance | null) => {
  if (item) itemRefs.set(key, item)
  else itemRefs.delete(key)
}

/** The page renders no element of its own, its items are placed straight in the list, so it is found by the elements of its items. */
const getElements = (): Element[] => {
  if (stateRef.value) return [stateRef.value]

  return slotList.value.flatMap(slot => itemRefs.get(slot.key)?.getElements() ?? [])
}
const page = computed<number | null>(() => props.queryParams instanceof Object && 'page' in props.queryParams && Number.isInteger(props.queryParams.page) ? (props.queryParams.page as number) : null)

// The item is written to every cached scope of the model - this page, the other loaded pages, and any list or
// item query sharing the model key - so the index only serves to find which item was edited.
const updateItem = (index: number, newItem: Data | undefined) => {
  const oldItem = data.value?.results[index]

  if (oldItem === undefined) return

  if (newItem) setItem(newItem)
  else removeItem(props.valueGetter(oldItem))
}

const setterList: ((newItem?: Data) => void)[] = []

const getSetter = (index: number): ((newItem?: Data) => void) => {
  return setterList[index] ??= (newItem?: Data) => updateItem(index, newItem)
}

const emitRefetch = () => {
  emit('refetch')
}

const getItemScope = (slot: ItemSlot, index: number, page: number) => {
  const results = data.value?.results
  const item = slot.id !== null && results ? results[index]! : getPlaceholder(slot.key)

  return {
    item,
    setter: getSetter(index),
    refetch: emitRefetch,
    skeleton: slot.id === null,
    next: slot.id !== null ? results?.[index + 1] : undefined,
    previous: slot.id !== null ? results?.[index - 1] : undefined,
    first: props.firstPage && index === 0,
    last: props.lastPage && index === slotList.value.length - 1,
    page,
    index,
    position: getPosition(page, index, props.pageLength),
    value: props.valueGetter(item),
    results,
    intersecting: isIntersecting.value,
  }
}

const refetchPage = async () => {
  await refetch()

  if (props.lastPage && data.value?.next !== undefined) emit('update:next-page', data.value.next)
  if (props.firstPage && data.value?.previous !== undefined) emit('update:previous-page', data.value.previous)
}

const getFirst = () => data.value?.results.at(0)

const getLast = () => data.value?.results.at(-1)

/** Item to scroll to again once the page's data replaces the skeletons, which can change the item's position. */
let pendingIndex: number | undefined

const scrollToItem = (index: number | undefined, behavior: ScrollBehavior) => {
  const slot = index === undefined ? undefined : slotList.value[index]
  // The last element: whatever is rendered with the item, such as a group heading, comes before it.
  const item = (slot ? itemRefs.get(slot.key)?.getElements().at(-1) : undefined) ?? getElements()[0]

  if (item) scrollInParent(item, {block: 'center', behavior})
}

const scrollTo = (index?: number, behavior: ScrollBehavior = 'smooth') => {
  scrollToItem(index, behavior)

  pendingIndex = data.value ? undefined : index
}

watch(data, value => {
  if (!value || pendingIndex === undefined) return

  scrollToItem(pendingIndex, 'instant')
  pendingIndex = undefined
}, {flush: 'post'})

watch(data, value => {
  if (props.firstPage && value?.previous !== undefined) emit('update:previous-page', value.previous)
  if (props.lastPage && value?.next !== undefined) emit('update:next-page', value.next)
  if (value?.pages_count !== undefined) emit('update:pages-count', value.pages_count)
  // A page with one after it is full, whatever page size the API settled on.
  if (value?.next && value.results.length !== 0) emit('update:page-size', value.results.length)
  if (value?.count !== undefined) emit('update:count', value.count)
}, {immediate: true})

const errorStatusList: (number | undefined)[] = [404, 400]

const isFailed = computed(() => !!error.value && !(error.value instanceof ApiErrorCancel) && !data.value)

const errorMessage = computed(() => getLoadErrorMessage(error.value))

useHandledQueryError(() => isFailed.value ? error.value : null)

watch(error, error => {
  if (!(error instanceof ApiError)) return

  if (errorStatusList.includes(error.response?.status) && page.value !== null && page.value > 1) emit('remove:page', page.value)

  emit('update:error', error)
}, {immediate: true})

watch(isFetching, value => {
  if (!value) return

  emit('fetched')
}, {immediate: true})

let intersectionObserver: IntersectionObserver | undefined
const observedElements = new Set<Element>()
const intersectingElements = new Set<Element>()

const observerCb = (entries: IntersectionObserverEntry[]) => {
  for (const entry of entries) {
    if (entry.isIntersecting && observedElements.has(entry.target)) intersectingElements.add(entry.target)
    else intersectingElements.delete(entry.target)
  }

  isIntersecting.value = intersectingElements.size !== 0
}

/** Observes the elements the page renders now, which change as its items load, are added or removed. */
const observeElements = () => {
  if (!intersectionObserver) return

  const elements = new Set(getElements())

  for (const element of observedElements) {
    if (elements.has(element)) continue

    intersectionObserver.unobserve(element)
    observedElements.delete(element)
    intersectingElements.delete(element)
  }

  for (const element of elements) {
    if (observedElements.has(element)) continue

    intersectionObserver.observe(element)
    observedElements.add(element)
  }

  isIntersecting.value = intersectingElements.size !== 0
}

onMounted(() => {
  intersectionObserver = new IntersectionObserver(
    observerCb,
    {
      root: scrollingElement?.value,
      rootMargin: '0px',
      threshold: 0,
    },
  )

  observeElements()
})

watch([slotList, isFailed], observeElements, {flush: 'post'})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  intersectionObserver = undefined
  observedElements.clear()
  intersectingElements.clear()

  if (page.value !== null) emit('remove:page', page.value)
})

defineExpose({
  getElements,
  getFirst,
  getLast,
  refetch: refetchPage,
  scrollTo,
  isFetching,
  pageNumber: page,
})

defineSlots<{
  default?: (props: Omit<InfiniteListItemScope<Data, Model>, 'resetting'>) => void
  empty?: () => void
  error?: (props: {error: Error, retry: () => Promise<void>, isFetching: boolean}) => void
}>()
</script>
