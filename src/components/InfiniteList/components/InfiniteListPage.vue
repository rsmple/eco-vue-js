<template>
  <div
    ref="element"
    class="relative"
  >
    <template v-if="queryParams.page && data?.results.length !== 0">
      <div
        class="flex"
        :class="{
          'sm:pt-4': (selected === undefined || !allowPageSelection) && hidePageTitle && !noGap,
        }"
      >
        <InfiniteListPageSelection
          v-if="selected !== undefined && allowPageSelection"
          :selected="selected"
          :items="data?.results ?? []"
          :disabled="!data?.results"
          :tooltip-text-persisted="hidePageTitle"
          :select-only="selectOnly"
          :unselect-only="unselectOnly"
          :reverse="reverseSelection"
          :value-getter="valueGetter"

          class="sm:w-list-row-item sm-not:px-[calc(var(--inner-margin)-2px)] pb-4 pt-6"
          @update:selected="$emit('update:selected', $event)"
        />

        <InfiniteListPageTitle
          v-if="!hidePageTitle"
          :query-params="queryParams"
          class="pb-4 pt-6"
        />
      </div>

      <div :class="pageClass">
        <template v-if="data?.results">
          <TransitionGroup
            v-if="transition"
            enter-active-class="transition-[grid-template-rows] overflow-hidden grid"
            enter-from-class="grid-rows-[0fr]"
            enter-to-class="grid-rows-[1fr]"
            leave-active-class="transition-[grid-template-rows] overflow-hidden grid"
            leave-from-class="grid-rows-[1fr]"
            leave-to-class="grid-rows-[0fr]"
            :css="!resetting"
          >
            <div
              v-for="(item, index) in data.results"
              :key="valueGetter(item)"
              class="w-full group"
            >
              <div class="[overflow:inherit]">
                <slot
                  :item="item"
                  :setter="(newItem?: Data) => setItem(index, newItem)"
                  :refetch="emitRefetch"
                  :skeleton="false"
                  :next="data?.results[index + 1]"
                  :previous="data?.results[index - 1]"
                  :first="firstPage && index === 0"
                  :last="lastPage && index === data.results.length - 1"
                />
              </div>
            </div>
          </TransitionGroup>

          <template v-else>
            <template
              v-for="(item, index) in data.results"
              :key="valueGetter(item)"
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
              />
            </template>
          </template>
        </template>

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
            />
          </template>
        </template>
      </div>
    </template>

    <div
      v-else
      class="text-accent text-base font-normal"
      :class="{
        'py-16 px-8 text-center flex justify-center': !minHeight,
        'pt-4 pb-2 px-[1.0625rem]': minHeight,
      }"
    >
      <div class="select-none cursor-default w-select-field sm-not:px-3">
        {{ emptyStub }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData">
import {toRef, computed, watch, ref, onMounted, nextTick, onBeforeUnmount} from 'vue'
import InfiniteListPageTitle from './InfiniteListPageTitle.vue'
import InfiniteListPageSelection from './InfiniteListPageSelection.vue'

const props = withDefaults(
  defineProps<{
    queryParams: QueryParams
    useQueryFn: UsePaginatedQuery<Data>
    isInvalidPage: (error: unknown) => boolean
    skeletonLength: number
    firstPage: boolean
    lastPage: boolean
    hidePageTitle?: boolean
    selected?: Model[]
    wrap?: boolean
    noGap?: boolean
    transition?: boolean
    resetting?: boolean
    emptyStub?: string
    selectOnly?: boolean
    unselectOnly?: boolean
    reverseSelection?: boolean
    allowPageSelection?: boolean
    minHeight?: boolean
    pageClass?: string
    refetchInterval?: number | false
    scrollingElement?: Element | null
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
  },
)

const emit = defineEmits<{
  (e: 'update:count', value: number): void
  (e: 'update:pagesCount', value: number): void
  (e: 'update:nextPage', value: number | null): void
  (e: 'update:previousPage', value: number | null): void
  (e: 'update:scroll', value: number): void
  (e: 'error:invalidPage', value: number): void
  (e: 'refetch'): void
  (e: 'update-from-header:scroll'): void
  (e: 'update:selected', values: Model[]): void
  (e: 'fetched'): void
}>()

const element = ref<HTMLElement>()
const isIntersecting = ref(false)

const {data, error, setData, refetch, isFetching} = props.useQueryFn(
  toRef(props, 'queryParams'),
  {
    refetchInterval: props.refetchInterval ? computed(() => isIntersecting.value ? props.refetchInterval : undefined) : undefined,
  },
)
const nextPage = computed(() => data.value?.next)
const previousPage = computed(() => data.value?.previous)

const setItem = (index: number, newItem: Data | undefined) => {
  if (!data.value) return

  const newData: PaginatedResponse<Data> = {
    ...data.value,
    results: [...data.value.results],
  }

  if (newItem) newData.results.splice(index, 1, newItem)
  else newData.results.splice(index, 1)

  setData(newData)
}

const emitRefetch = () => {
  emit('refetch')
}

const refetchPage = async () => {
  await refetch()

  if (props.lastPage && nextPage.value !== undefined) emit('update:nextPage', nextPage.value)
  if (props.firstPage && previousPage.value !== undefined) emit('update:previousPage', previousPage.value)
}

const getFirst = () => {
  if (!data.value) return undefined
  return data.value.results[0]
}

const getLast = () => {
  if (!data.value) return undefined
  return data.value.results[data.value.results.length - 1]
}

watch(data, value => {
  if (props.firstPage && value?.previous !== undefined) emit('update:previousPage', value.previous)
  if (props.lastPage && value?.next !== undefined) emit('update:nextPage', value.next)
  if (value?.pages_count) emit('update:pagesCount', value.pages_count)
  if (value?.count !== undefined) emit('update:count', value.count)
}, {immediate: true})

watch(error, (error: unknown): void => {
  if (props.isInvalidPage(error)) emit('error:invalidPage', props.queryParams.page as number)
}, {immediate: true})

watch(isFetching, value => {
  if (value) return

  emit('fetched')
})

let height = 0
let intersectionObserver: IntersectionObserver | undefined

const observerCb = (entries: IntersectionObserverEntry[]) => {
  isIntersecting.value = entries.some(entry => {
    if (entry.target === element.value) {
      return entry.isIntersecting
    }
  })
}

onMounted(() => {
  if (props.refetchInterval && element.value) {
    intersectionObserver = new IntersectionObserver(
      observerCb,
      {
        root: props.scrollingElement ?? null,
        rootMargin: '0px',
        threshold: 0,
      },
    )

    intersectionObserver.observe(element.value)
  }

  height = element.value?.getBoundingClientRect()?.height ?? 0

  if (height === 0) return
  if (!props.firstPage) return
  if (props.lastPage) {
    if (props.queryParams.page !== 1) nextTick().then(() => emit('update-from-header:scroll'))

    return
  }

  emit('update:scroll', height)
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  intersectionObserver = undefined
})

watch(data, async (_, oldValue) => {
  if (oldValue) return

  await nextTick()

  const newHeight = (element.value?.getBoundingClientRect().height ?? 0) - height

  if (newHeight === 0) return
  if (!props.firstPage) return
  if (props.lastPage) return

  emit('update:scroll', newHeight)
})

defineExpose({
  getFirst,
  getLast,
  refetch: refetchPage,
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
  }) => void
}>()

</script>
