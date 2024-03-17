<template>
  <div ref="indicator" />

  <div
    ref="header"
    class="sticky top-[var(--header-height)]"
    :class="{
      'z-[1]': isIntersecting,
      'z-20': !isIntersecting,
    }"
  >
    <slot name="header" />
  </div>

  <WInfiniteListPages
    :query-params="queryParams"
    :use-query-fn="useQueryFn"
    :is-invalid-page="isInvalidPage"
    :scrolling-element="scrollingElement"

    :skip-scroll-target="skipScrollTarget"
    :skeleton-length="skeletonLength"
    :hide-page-title="hidePageTitle"
    :selected="selected"
    :wrap="wrap"
    :no-gap="noGap"
    :transition="transition"
    :page-length="pageLength"
    :header-top="headerTopIgnore ? 0 : headerTop"
    :header-height="headerHeight"
    :min-height="minHeight"
    :exclude-params="excludeParams"
    :empty-stub="emptyStub"
    :select-only="selectOnly"
    :unselect-only="unselectOnly"
    :reverse-selection="reverseSelection"
    :allow-page-selection="allowPageSelection"
    :page-class="pageClass"
    :max-pages="maxPages"
    :refetch-interval="refetchInterval"
    :value-getter="valueGetter"

    @update:count="$emit('update:count', $event)"
    @update:selected="$emit('update:selected', $event)"
    @update:page="$emit('update:page', $event)"
  >
    <template #default="{item, setter, skeleton, refetch, previous, next, first, last, resetting}">
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
      />
    </template>
  </WInfiniteListPages>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData">
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useInfiniteListHeader} from './use/useInfiniteListHeader'
import WInfiniteListPages from './WInfiniteListPages.vue'

const props = withDefaults(
  defineProps<{
    useQueryFn: UsePaginatedQuery<Data>
    isInvalidPage: (error: unknown) => boolean
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    headerMargin?: number
    skipScrollTarget?: boolean
    selected?: Model[]
    wrap?: boolean
    noGap?: boolean
    transition?: boolean
    pageLength?: number
    scrollingElement?: Element | null
    headerTopIgnore?: boolean
    minHeight?: boolean
    excludeParams?: string[]
    emptyStub?: string
    selectOnly?: boolean
    unselectOnly?: boolean
    reverseSelection?: boolean
    allowPageSelection?: boolean
    pageClass?: string
    maxPages?: number
    refetchInterval?: number | false
    valueGetter?: (data: Data) => Model
  }>(),
  {
    skeletonLength: undefined,
    headerMargin: 0,
    selected: undefined,
    pageLength: undefined,
    scrollingElement: undefined,
    excludeParams: undefined,
    emptyStub: undefined,
    pageClass: undefined,
    maxPages: undefined,
    refetchInterval: undefined,
    valueGetter: (item: Data) => (item.id as Model),
  },
)

const emit = defineEmits<{
  (e: 'update:page', value: number | undefined): void
  (e: 'update:header-padding', value: number): void
  (e: 'update:count', value: number): void
  (e: 'update:selected', values: Model[]): void
}>()

const infiniteList = ref<ComponentInstance<typeof WInfiniteListPages<Model, Data>> | undefined>()

const updateHeaderPadding = (value: number): void => {
  emit('update:header-padding', value)
}

const {indicator, header, headerTop, headerHeight, isIntersecting} = useInfiniteListHeader(props.scrollingElement)

watch(isIntersecting, value => {
  if (!value && headerHeight.value) {
    updateHeaderPadding(headerHeight.value - props.headerMargin)
  } else {
    updateHeaderPadding(0)
  }
})

onMounted(() => {
  if (props.queryParams.page && props.queryParams.page > 1) {
    isIntersecting.value = false
  }
})

onBeforeUnmount(() => {
  updateHeaderPadding(0)
})

defineExpose({
  resetPage() {
    infiniteList.value?.resetPage()
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
  }) => void
  header?: (props: Record<string, never>) => void
}>()

</script>
