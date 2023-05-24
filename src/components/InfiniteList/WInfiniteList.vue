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
    <div
      v-for="(slot, index) in $slots.header?.()"
      :key="index"
      class="flex sm:w-[calc(100vw-var(--nav-bar-width)-var(--inner-margin))]"
    >
      <component
        :is="slot"
        class="sm:w-[calc(100vw-var(--inner-width-diff))]"
      />

      <div class="sm-not:hidden sm:pr-[calc(var(--actions-bar-width)+var(--inner-margin))]" />
    </div>
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

    @update:count="$emit('update:count', $event)"
    @update:selected="$emit('update:selected', $event)"
    @update:page="$emit('update:page', $event)"
  >
    <template #default="{item, setter, skeleton, refetch, previous, next, first, last}">
      <slot
        :item="item"
        :setter="setter"
        :skeleton="skeleton"
        :refetch="refetch"
        :previous="previous"
        :next="next"
        :first="first"
        :last="last"
      />
    </template>
  </WInfiniteListPages>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, ref, watch} from 'vue'
import type {QueryParams, UseDefaultQueryFn} from './models/types'
import {useInfiniteListHeader} from './use/useInfiniteListHeader'
import WInfiniteListPages from './WInfiniteListPages.vue'

const props = withDefaults(
  defineProps<{
    useQueryFn: UseDefaultQueryFn
    isInvalidPage: (error: unknown) => boolean
    queryParams: QueryParams
    skeletonLength?: number
    hidePageTitle?: boolean
    headerMargin?: number
    skipScrollTarget?: boolean
    selected?: number[]
    wrap?: boolean
    noGap?: boolean
    transition?: boolean
    pageLength?: number
    scrollingElement?: Element | null
    headerTopIgnore?: boolean
    minHeight?: boolean
  }>(),
  {
    skeletonLength: undefined,
    headerMargin: 0,
    selected: undefined,
    pageLength: undefined,
    scrollingElement: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:page', value: number | undefined): void
  (e: 'update:header-padding', value: number): void
  (e: 'update:count', value: number): void
  (e: 'update:selected', values: number[]): void
  (e: 'close'): void
}>()

const infiniteList = ref<InstanceType<typeof WInfiniteListPages> | undefined>()

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

onBeforeUnmount(() => {
  updateHeaderPadding(0)
})

defineExpose({
  resetPage() {
    infiniteList.value?.resetPage()
  },
})

</script>
