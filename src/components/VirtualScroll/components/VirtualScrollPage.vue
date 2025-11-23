<template>
  <div ref="page">
    <div>
      virtualIndex: {{ virtualIndex }}
    </div>
    <template
      v-for="(item, index) in data?.results ?? (skeletonItems as Model[])"
      :key="item.id"
    >
      <slot v-bind="{item, updatePageHeight, index, page}" />
    </template>
  </div>
</template>

<script setup lang="ts" generic="Model extends {id: string | number}, QueryParams">
import {computed, nextTick, onMounted, ref, useTemplateRef, watch} from 'vue'

const props = defineProps<{
  virtualIndex: number
  useQueryFn: UseQueryWithParams<PaginatedResponse<Model>, QueryParams>
  queryParams: QueryParams
  page: number | null
  initialPageHeight: number
  skeletonLength: number
}>()

const emit = defineEmits<{
  (e: 'update:page-count', value: number): void
  (e: 'update:count', value: number): void
  (e: 'update:page-height'): void
}>()

const skeletonItems = computed(() => Array(props.skeletonLength).fill(null).map((_, id) => ({id})))

const queryParams = computed(() => ({...props.queryParams, page: props.page}))

const {data} = props.useQueryFn(queryParams, {enabled: computed(() => props.page !== null)})

const pageRef = useTemplateRef('page')

const pageHeight = ref(props.initialPageHeight)

const pageCount = computed(() => data.value?.pages_count)
const count = computed(() => data.value?.count)

const pageNumber = computed(() => props.page)

const updatePageHeight = () => {
  pageHeight.value = pageRef.value?.offsetHeight ?? props.initialPageHeight

  emit('update:page-height')
}

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

onMounted(() => {
  updatePageHeight()
})

defineExpose({
  pageHeight,
  pageCount,
  pageNumber,
})
</script>