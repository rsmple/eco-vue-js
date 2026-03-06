<template>
  <WModalWrapper class="w-modal-wrapper-w-[40rem]">
    <template #title>
      {{ (typeof title === 'string' ? title : title?.(count)) ?? `Exporting${query.data.value ? ` ${count} item${count === 1 ? '' : 's'}` : ''}` }}
    </template>

    <div class="mb-4">
      <WProgressStriped
        :model-value="progress * 100"
        class="bg-primary dark:bg-primary-dark"
      />

      <div class="text-description mt-1 text-end text-xs">
        {{ page }} / {{ pagesCount }}
      </div>
    </div>

    <template #actions>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="loading"
        class="flex-1"
        @click="$emit('close:modal')"
      >
        {{ cancelText ?? 'Close' }}
      </WButton>

      <WButton
        :href="urlToBlob"
        :download="`${fileName}_${dateToQueryString(new Date())}.json`"
        :semantic-type="SemanticType.PRIMARY"
        :disabled="!isDone"
        :loading="loading"
        tag="a"
        class="flex-1"
        @click="handleDownload"
      >
        {{ downloadText ?? 'Download' }}
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup generic="Model, QueryParams, PreparedModel">
import {keepPreviousData} from '@tanstack/vue-query'
import {computed, ref, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'

import {SemanticType} from '@/utils/SemanticType'
import {dateToQueryString} from '@/utils/dateTime'

import WProgressStriped from '../Progress/WProgressStriped.vue'

const props = defineProps<{
  fileName: string
  title?: string | ((count: number) => string)
  cancelText?: string
  downloadText?: string
  initQueryParams?: QueryParams
  useQueryFn: UseQueryPaginated<Model, QueryParams> | UseQueryWithParams<Model[], QueryParams>
  prepare?: (item: Model) => PreparedModel
  resolve?: () => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const cache = ref<PreparedModel[]>([])
const page = ref(1)
const loading = ref(false)

const queryParams = computed<QueryParams>(() => ({...(props.initQueryParams ?? {} as QueryParams), page: page.value}))

const query = props.useQueryFn(queryParams, {
  refetchOnMount: true,
  refetchInterval: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
  refetchOnReconnect: false,
  placeholderData: keepPreviousData,
})

const count = computed(() => Array.isArray(query.data.value) ? query.data.value.length : query.data.value?.count ?? 0)

const pagesCount = computed<number | null>(() => query.data.value ? 'pages_count' in query.data.value ? query.data.value.pages_count : 1 : null)

const progress = computed<number>(() => {
  if (pagesCount.value === null || pagesCount.value < 1) return 0

  return page.value / pagesCount.value
})

const isDone = computed<boolean>(() => progress.value === 1)

const exportValue = computed<string>(() => {
  if (!isDone.value) return ''

  return JSON.stringify(cache.value)
})

const blob = computed<Blob | undefined>(() => {
  if (!isDone.value || !exportValue.value) return

  return new Blob([exportValue.value], {type: 'application/json'})
})

const urlToBlob = computed<string | undefined>(() => blob.value ? URL.createObjectURL(blob.value) : undefined)

const handleDownload = (): void => {
  loading.value = true

  setTimeout(() => {
    loading.value = false

    props.resolve?.()

    emit('close:modal')
  }, 500)
}

watch(query.data, data => {
  const list = Array.isArray(data) ? data : (data as unknown as PaginatedResponse<Model>)?.results as Model[]

  if (list?.length) {
    cache.value.push(...(props.prepare ? list.map(props.prepare) : list) as typeof cache.value)
  }

  if (pagesCount.value && page.value < pagesCount.value) page.value = page.value + 1
}, {immediate: true})
</script>