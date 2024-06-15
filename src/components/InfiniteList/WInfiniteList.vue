<template>
  <template v-if="!minHeight">
    <div ref="indicator" />

    <div
      ref="header"
      class="sticky top-[var(--header-height)]"
      :class="{
        'z-[1]': isIntersecting,
        'z-20': !isIntersecting,
      }"
    >
      <slot
        name="header"
        v-bind="{selectAllValue, goto}"
      />
    </div>
  </template>

  <WInfiniteListPages
    ref="infiniteListPages"
    :query-params="(queryParams as QueryParams)"
    :use-query-fn="useQueryFn"
    :is-invalid-page="isInvalidPage"
    :scrolling-element="scrollingElement"

    :skip-scroll-target="skipScrollTarget"
    :skeleton-length="skeletonLength"
    :hide-page-title="hidePageTitle"
    :wrap="wrap"
    :no-gap="noGap"
    :transition="transition"
    :page-length="pageLength"
    :header-top="headerTopIgnore ? 0 : headerTop"
    :header-height="headerHeight"
    :min-height="minHeight"
    :exclude-params="excludeParams"
    :empty-stub="emptyStub"
    :page-class="pageClass"
    :max-pages="maxPages"
    :refetch-interval="refetchInterval"
    :query-options="queryOptions"

    :selected="selected"
    :value-getter="valueGetter"
    :select-only="selectOnly"
    :unselect-only="unselectOnly"
    :reverse-selection="reverseSelection"
    :allow-page-selection="allowPageSelection"
    @update:selected="$emit('select', $event)"

    @update:count="$emit('update:count', $event)"
    @update:page="$emit('update:page', $event)"
  >
    <template #default="{item, setter, skeleton, refetch, previous, next, first, last, resetting, page, index}">
      <InfiniteListPageSelectItem
        :selected="skeleton ? false : getIsSelected(valueGetter(item))"
        :selected-between="skeleton ? false : getIsSelectedBetween(valueGetter(item), page, index)"
        @update:selected="
          toggleSelected(valueGetter(item), reverse && !selectedRange ? !$event : $event);
          setSelectedCursor($event ? {page, index, id: valueGetter(item)} : null);
        "
        @update:selected-range="setSelectedRange({page, index, id: valueGetter(item)})"
        @update:selected-range-hover="setRangeHover({page, index, id: valueGetter(item)})"
      >
        <slot
          :item="item"
          :setter="setter"
          :skeleton="skeleton"
          :refetch="refetch"
          :previous="previous"
          :next="next"
          :first="first"
          :last="last"
          :resetting="resetting"
          :page="page"
          :index="index"
        />
      </InfiniteListPageSelectItem>
    </template>
  </WInfiniteListPages>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, ApiError, QueryParams">
import {onBeforeUnmount, onMounted, provide, ref, toRef, watch} from 'vue'
import {useInfiniteListHeader} from './use/useInfiniteListHeader'
import WInfiniteListPages from './WInfiniteListPages.vue'
import InfiniteListPageSelectItem from './components/InfiniteListPageSelectItem.vue'
import {useSelected} from './use/useSelected'
import {wInfiniteListSelection} from './models/injection'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
    isInvalidPage: (error: unknown) => boolean
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    headerMargin?: number
    skipScrollTarget?: boolean
    wrap?: boolean
    noGap?: boolean
    transition?: boolean
    scrollingElement?: Element | null
    headerTopIgnore?: boolean
    minHeight?: boolean
    excludeParams?: (keyof QueryParams)[]
    emptyStub?: string
    pageClass?: string
    maxPages?: number
    refetchInterval?: number | false
    queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>

    pageLength?: number
    count?: number

    allowSelect?: boolean
    allowSelectRange?: boolean

    valueGetter?: (data: Data) => Model
    selected?: Model[]
    selectedRange?: SelectedRange<Model>
    reverse?: boolean

    selectOnly?: boolean
    unselectOnly?: boolean
    reverseSelection?: boolean
    allowPageSelection?: boolean
  }>(),
  {
    skeletonLength: undefined,
    headerMargin: 0,
    selected: () => [],
    scrollingElement: undefined,
    excludeParams: undefined,
    emptyStub: undefined,
    pageClass: undefined,
    maxPages: undefined,
    refetchInterval: undefined,
    valueGetter: (item: Data) => (item.id as Model),
    queryOptions: undefined,

    pageLength: 24,
    count: 0,
    selectedRange: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:page', value: number | undefined): void
  (e: 'update:header-padding', value: number): void
  (e: 'update:count', value: number): void

  (e: 'select', values: Model[]): void
  (e: 'select-reverse', values: Model[]): void
  (e: 'select-range', value: SelectedRange<Model>): void
}>()

const infiniteListPages = ref<ComponentInstance<typeof WInfiniteListPages<Model, Data, ApiError, QueryParams>> | undefined>()

const updateHeaderPadding = (value: number): void => {
  emit('update:header-padding', value)
}

const goto = (page: number, itemIndex?: number) => {
  infiniteListPages.value?.goto(page, itemIndex)
}

const {indicator, header, headerTop, headerHeight, isIntersecting} = useInfiniteListHeader(props.scrollingElement)

const {
  setSelectedRange,
  getIsSelected,
  getIsSelectedBetween,
  allowSelectHover,
  setRangeHover,
  setSelectedCursor,
  toggleSelected,
  selectedCount,
  selectAllValue,
} = useSelected<Model>(
  toRef(props, 'count'),
  toRef(props, 'pageLength'),
  toRef(props, 'selected'),
  toRef(props, 'reverse'),
  toRef(props, 'selectedRange'),

  (value) => emit('select', value),
  (value) => emit('select-reverse', value),
  (value) => emit('select-range', value),
)

provide(wInfiniteListSelection, {
  allowSelect: toRef(props, 'allowSelect'),
  allowSelectRange: toRef(props, 'allowSelectRange'),
  allowSelectHover,
  selectedCount,
  clearSelected: () => emit('select', []),
})

watch(isIntersecting, value => {
  if (!value && headerHeight.value) {
    updateHeaderPadding(headerHeight.value - props.headerMargin)
  } else {
    updateHeaderPadding(0)
  }
})

onMounted(() => {
  if ((props.queryParams as {page?: number}).page && (props.queryParams as {page: number}).page > 1) {
    isIntersecting.value = false
  }
})

onBeforeUnmount(() => {
  updateHeaderPadding(0)
})

defineExpose({
  resetPage() {
    infiniteListPages.value?.resetPage()
  },
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
  }) => void
  header?: (props: {
    goto: typeof goto
    selectAllValue: typeof selectAllValue.value
  }) => void
}>()

</script>
