<template>
  <WModalWrapper class="w-modal-wrapper-w-[40rem]">
    <template #title>
      {{ resolvedTitle }}
    </template>

    <div
      v-if="isPaginated"
      class="mb-4"
    >
      <WProgressBar
        :model-value="progress"
        :semantic-type="SemanticType.PRIMARY"
      />

      <div class="text-description mt-1 text-end text-xs">
        {{ page }} / {{ pagesCount }} page{{ pagesCount === 1 ? '' : 's' }}
      </div>
    </div>

    <div
      v-else
      class="mb-4 text-center"
    >
      <div v-if="loading">
        <WSpinner class="w-spinner-size-[1.25em] inline" /> Loading
      </div>

      <div v-else>
        Download is ready
      </div>
    </div>

    <template #actions>
      <WButton
        :semantic-type="SemanticType.SECONDARY"
        class="flex-1"
        @click="$emit('close:modal')"
      >
        {{ cancelText ?? 'Close' }}
      </WButton>

      <WButton
        :href="urlToBlob"
        :download="`${fileName ? `${fileName}_` : ''}${dateToQueryString(new Date())}.${format}`"
        :semantic-type="SemanticType.PRIMARY"
        :disabled="!exportValue"
        :loading="loading || loadingExportValue"
        tag="a"
        class="flex-1"
        @click="handleDownload"
      >
        {{ downloadText ?? 'Download' }}
      </WButton>
    </template>
  </WModalWrapper>
</template>

<script lang="ts" setup generic="Model, QueryParams">
import type {ModalExportProps} from './types'

import {keepPreviousData} from '@tanstack/vue-query'
import {computed, onMounted, ref, watch} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WModalWrapper from '@/components/Modal/WModalWrapper.vue'

import {Notify} from '@/utils/Notify'
import {SemanticType} from '@/utils/SemanticType'
import {handleApiError} from '@/utils/api'
import {dateToQueryString} from '@/utils/dateTime'
import {buildCsvContent} from '@/utils/exportToCsv'

import WProgressBar from '../Progress/WProgressBar.vue'
import WSpinner from '../Spinner/WSpinner.vue'

const props = defineProps<ModalExportProps<Model, QueryParams>>()

const emit = defineEmits<{
  (e: 'close:modal'): void
}>()

const cache = ref<Model[]>([])
const page = ref(1)
const loading = ref(!!props.apiMethod)
const loadingExportValue = ref(false)

const queryParams = computed<QueryParams>(() => ({...(props.initQueryParams ?? {} as QueryParams), page: page.value}))

const query = props.useQueryFn?.(queryParams, {
  refetchOnMount: true,
  refetchInterval: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
  refetchOnReconnect: false,
  placeholderData: keepPreviousData,
})

const isPaginated = !!query

const pagesCount = computed<number | null>(() => {
  if (!query) return null
  const data = query.data.value
  if (!data) return null
  return 'pages_count' in (data as object) ? (data as PaginatedResponse<Model>).pages_count : 1
})

const progress = computed<number>(() => {
  if (pagesCount.value === null || pagesCount.value < 1) return 0
  return page.value / pagesCount.value
})

const count = computed<number>(() => {
  if (query) {
    const data = query.data.value
    return Array.isArray(data) ? data.length : (data as PaginatedResponse<Model>)?.count ?? 0
  }
  return cache.value.length
})

const resolvedTitle = computed<string>(() => {
  if (typeof props.title === 'function') return props.title(count.value)
  if (typeof props.title === 'string') return props.title
  if (props.format === 'csv') return 'Export to .csv'
  return `Exporting${ count.value ? ` ${ count.value } item${ count.value === 1 ? '' : 's' }` : '' }`
})

const exportValue = ref<string>('')

const buildExportValue = async () => {
  if (props.format === 'csv') {
    loadingExportValue.value = true
    const rows = await Promise.all(cache.value.map(item => props.prepare!(item as Model)))
    exportValue.value = buildCsvContent(rows, props.header)
    loadingExportValue.value = false
  } else {
    exportValue.value = JSON.stringify(cache.value)
  }
}

const blob = computed<Blob | undefined>(() => {
  if (!exportValue.value) return
  const type = props.format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json'
  return new Blob([exportValue.value], {type})
})

const urlToBlob = computed<string | undefined>(() => blob.value ? URL.createObjectURL(blob.value) : undefined)

const handleDownload = (): void => {
  loading.value = true

  setTimeout(() => {
    loading.value = false

    props.resolve?.()

    Notify.success({title: 'File downloaded successfully'})

    emit('close:modal')
  }, 500)
}

if (query) {
  watch(query.data, data => {
    const list = Array.isArray(data) ? data : (data as unknown as PaginatedResponse<Model>)?.results

    if (list?.length) {
      cache.value.push(...list as typeof cache.value)
    }

    if (pagesCount.value && page.value < pagesCount.value) page.value = page.value + 1
    else if (pagesCount.value) buildExportValue()
  }, {immediate: true})
}

if (props.apiMethod) {
  onMounted(() => {
    props.apiMethod!()
      .then(response => {
        cache.value = response
        buildExportValue()
      })
      .catch(handleApiError)
      .finally(() => {
        loading.value = false
      })
  })
}
</script>
