<template>
  <div
    ref="element"
    class="relative"
  >
    <template v-if="queryParams.page && data?.results.length !== 0">
      <div
        class="flex"
        :class="{
          'sm:pt-6': selected === undefined && hidePageTitle && !noGap,
        }"
      >
        <InfiniteListPageSelection
          v-if="selected !== undefined"
          :selected="selected"
          :items="data?.results ?? []"
          :disabled="!data?.results"
          :tooltip-text-persisted="hidePageTitle"
          :select-only="selectOnly"
          :unselect-only="unselectOnly"

          class="sm:w-list-row-item sm-not:px-[calc(var(--inner-margin)-2px)] pb-4 pt-6"
          @update:selected="$emit('update:selected', $event)"
        />

        <InfiniteListPageTitle
          v-if="!hidePageTitle"
          :query-params="queryParams"
          class="pb-4 pt-6"
        />
      </div>

      <div
        class="flex items-start justify-start"
        :class="{
          'sm-not:flex-col sm:flex-wrap': wrap,
          'flex-col': !wrap,
          'sm:gap-4': !noGap,
        }"
      >
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
              :key="item.id"
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
              :key="item.id"
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
      class="py-16 px-8 text-accent text-base font-normal text-center"
    >
      {{ emptyStub }}
    </div>
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData">
import {toRef, computed, watch, ref, onMounted, nextTick} from 'vue'
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
    selected?: number[]
    wrap?: boolean
    noGap?: boolean
    transition?: boolean
    resetting?: boolean
    emptyStub?: string
    selectOnly?: boolean
    unselectOnly?: boolean
  }>(),
  {
    keyGetter: undefined,
    selected: undefined,
    previous: undefined,
    emptyStub: 'Nothing to show',
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
  (e: 'update:selected', values: number[]): void
  (e: 'fetched'): void
}>()

const element = ref<HTMLElement>()

const {data, error, setData, refetch, isFetching} = props.useQueryFn(toRef(props, 'queryParams'))

const count = computed(() => data.value?.count)
const pagesCount = computed(() => data.value?.pages_count)
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

watch(count, value => {
  if (value !== undefined) emit('update:count', value)
}, {immediate: true})

watch(pagesCount, value => {
  if (value) emit('update:pagesCount', value)
}, {immediate: true})

watch(nextPage, value => {
  if (props.lastPage && value !== undefined) emit('update:nextPage', value)
}, {immediate: true})

watch(previousPage, value => {
  if (props.firstPage && value !== undefined) emit('update:previousPage', value)
}, {immediate: true})

watch(error, (error: unknown): void => {
  if (props.isInvalidPage(error)) emit('error:invalidPage' as any, props.queryParams.page as any)
}, {immediate: true})

watch(isFetching, value => {
  if (value) return

  emit('fetched')
})

let height = 0

onMounted(() => {
  height = element.value?.getBoundingClientRect()?.height ?? 0

  if (height === 0) return
  if (!props.firstPage) return
  if (props.lastPage) {
    if (props.queryParams.page !== 1) nextTick().then(() => emit('update-from-header:scroll'))

    return
  }

  emit('update:scroll', height)
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
