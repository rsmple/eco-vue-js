<template>
  <div ref="page">
    <div>
      virtualIndex: {{ virtualIndex }}
    </div>
    <template
      v-for="(item, index) in data?.results ?? (skeletonItems as Data[])"
      :key="item.id"
    >
      <slot v-bind="{item, updatePageHeight, index, page, refetch: emitRefetch}" />
    </template>

    <slot
      v-if="data?.results.length === 0"
      name="empty"
    >
      <div class="text-accent sm:-left--left-inner sm:-max-w--width-inner flex justify-center px-8 py-16 text-center font-normal sm:sticky">
        {{ emptyStub ?? 'Nothing to show' }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts" generic="Data extends {id: string | number}, QueryParams">
import type {ApiError} from '@/utils/api'

import {computed, nextTick, onMounted, ref, useTemplateRef, watch} from 'vue'

const props = defineProps<{
  virtualIndex: number
  useQueryFn: UseQueryWithParams<PaginatedResponse<Data>, QueryParams>
  queryOptions?: Partial<QueryOptions<PaginatedResponse<Data>>>
  queryParams: QueryParams
  page: number | null
  initialPageHeight: number
  skeletonLength: number
  emptyStub: string | undefined
}>()

const emit = defineEmits<{
  (e: 'update:page-count', value: number): void
  (e: 'update:count', value: number): void
  (e: 'update:page-height'): void
  (e: 'update:error', value: ApiError): void
  (e: 'refetch'): void
}>()

const skeletonItems = computed(() => Array(props.skeletonLength).fill(null).map((_, id) => ({id})))

const queryParams = computed(() => ({...props.queryParams, page: props.page}))

const {data, error, refetch, isFetching} = props.useQueryFn(queryParams, {...props.queryOptions ?? {}, enabled: computed(() => props.page !== null)})

const pageRef = useTemplateRef('page')

const pageHeight = ref(props.initialPageHeight)

const pageCount = computed(() => data.value?.pages_count)
const count = computed(() => data.value?.count)

const pageNumber = computed(() => props.page)

const updatePageHeight = () => {
  pageHeight.value = pageRef.value?.offsetHeight ?? props.initialPageHeight

  emit('update:page-height')
}

const emitRefetch = () => emit('refetch')

watch(data, async () => {
  await nextTick()

  updatePageHeight()
})

watch(pageCount, value => {
  if (value !== undefined) emit('update:page-count', value)
}, {immediate: true})

watch(count, value => {
  if (value !== undefined) emit('update:count', value)
}, {immediate: true})

watch(error, error => {
  if (error) emit('update:error', error)
}, {immediate: true})

onMounted(() => {
  updatePageHeight()
})

defineExpose({
  pageHeight,
  pageCount,
  pageNumber,
  refetch,
  isFetching,
})
</script>