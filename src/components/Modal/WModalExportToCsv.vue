<template>
  <WModalWrapper class="w-modal-wrapper-w-[40rem]">
    <template #title>
      Export to .csv
    </template>

    <div class="mb-4">
      <div class="text-accent mb-1 text-xs font-semibold">
        Loading progress
      </div>

      <WProgressBar
        :model-value="progress"
        :semantic-type="SemanticType.SECONDARY"
      />

      <div class="text-description mt-1 text-end text-xs">
        {{ page }} / {{ pagesCount }} pages
      </div>
    </div>

    <template #actions>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        :disabled="loading"
        class="flex-1"
        @click="$emit('close:modal')"
      >
        Close
      </WButton>

      <WButton
        :href="urlToBlob"
        :download="`${fileName}_${dateToQueryString(new Date())}.csv`"
        :semantic-type="SemanticType.PRIMARY"
        :disabled="!isDone"
        :loading="loading"
        tag="a"
        class="flex-1"
        @click="handleDownload"
      >
        Download
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup generic="Model, QueryParams">
import {computed, ref, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'
import WProgressBar from '@/components/Progress/WProgressBar.vue'

import {Notify} from '@/utils/Notify'
import {SemanticType} from '@/utils/SemanticType'
import {dateToQueryString} from '@/utils/dateTime'

const regExp = /("|,|\n)/g

const forbiddenStart = ['=', '+', '-', '@', '\t', '\r']

const props = defineProps<{
  fileName?: string
  header?: string[]
  initQueryParams?: QueryParams
  useQueryFn: UseQueryPaginated<Model, QueryParams>
  prepare: (item: Model) => (string | number | Date)[]
  resolve?: () => void
}>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const cache = ref<Model[]>([])
const page = ref(1)
const loading = ref(false)

const queryParams = computed<QueryParams>(() => ({...(props.initQueryParams ?? {} as QueryParams), page: page.value}))

const query = props.useQueryFn(queryParams, {
  refetchOnMount: true,
  refetchInterval: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
  refetchOnReconnect: false,
})

const pagesCount = computed<number | null>(() => query.data.value?.pages_count ?? null)

const progress = computed<number | null>(() => {
  if (pagesCount.value === null || pagesCount.value < 1) return null

  return page.value / pagesCount.value
})

const isDone = computed<boolean>(() => progress.value === 1)

const excapeString = (value: string | null | Date | number): string => {
  value = value === null ? '' : value instanceof Date ? value?.toLocaleString() ?? '' : value?.toString() ?? ''

  if (forbiddenStart.includes(value[0]!)) value = ' ' + value

  if (value.search(regExp) >= 0) return '"' + value.replace(/"/g, '""') + '"'
  else return value
}

const exportValue = computed<string>(() => {
  if (!isDone.value) return ''

  const result: string[] = []

  if (props.header) result.push(props.header.map(excapeString).join(','))

  for (const item of cache.value) {
    result.push(props.prepare((item as Model)).map(excapeString).join(','))
  }

  return result.join('\n')
})

const blob = computed<Blob | undefined>(() => {
  if (!isDone.value || !exportValue.value) return

  return new Blob([exportValue.value], {type: 'text/csv;charset=utf-8;'})
})

const urlToBlob = computed<string | undefined>(() => blob.value ? URL.createObjectURL(blob.value) : undefined)

const handleDownload = (): void => {
  loading.value = true

  setTimeout(() => {
    loading.value = false

    props.resolve?.()

    Notify.success({
      title: 'File downloaded successfully',
    })

    emit('close:modal')
  }, 500)
}

watch(query.data, data => {
  if (data?.results.length) {
    cache.value.push(...(data.results as typeof cache.value))
  }

  if (pagesCount.value && page.value < pagesCount.value) page.value = page.value + 1
}, {immediate: true})
</script>