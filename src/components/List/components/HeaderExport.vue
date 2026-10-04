<template>
  <DropdownOverlay
    :is-open="isOpen"
    frame-class="surface-raised grid grid-cols-1 overflow-hidden rounded-xl shadow-md border border-solid border-line-raised"
    sheet-class="grid grid-cols-1"
    close-on-click
    @close="isOpen = false"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconExport)"
        :active="isOpen"
        title="Export"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #header>
      Export
    </template>

    <template #content>
      <WMenuItem @click="exportAs('csv')">
        Export as CSV
      </WMenuItem>

      <WMenuItem @click="exportAs('json')">
        Export as JSON
      </WMenuItem>

      <WMenuItem
        v-if="toMarkdown"
        @click="exportAs('md')"
      >
        Export as Markdown
      </WMenuItem>
    </template>
  </DropdownOverlay>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {ListFields} from '../types'
import type {ModalExportProps} from '@/components/Modal/types'

import {defineAsyncComponent, markRaw, ref} from 'vue'

import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconExport from '@/assets/icons/IconExport.svg?component'

import DropdownOverlay from '@/components/DropdownMenu/components/DropdownOverlay.vue'
import {Modal} from '@/utils/Modal'

import {buildExportColumns} from '../use/useExportColumns'

const WModalExport = defineAsyncComponent(() => import('@/components/Modal/WModalExport.vue'))

const props = defineProps<{
  fields: ListFields<Data, QueryParams>
  queryParamsGetter: () => QueryParams
  useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
  apiMethod: ((queryParams: QueryParams) => Promise<Data[]>) | undefined
  fileName: string | undefined
  toMarkdown: ((item: Data, index: number) => string) | undefined
}>()

const isOpen = ref(false)

const exportAs = (format: 'csv' | 'json' | 'md') => {
  isOpen.value = false

  const modalProps: ModalExportProps<Data, QueryParams> = {
    fileName: props.fileName,
    format,
    useQueryFn: props.apiMethod ? undefined : props.useQueryFn,
    apiMethod: props.apiMethod,
    initQueryParams: props.queryParamsGetter(),
  }

  if (format === 'csv') {
    const {header, prepare} = buildExportColumns(props.fields, modalProps.initQueryParams!)
    modalProps.header = header
    modalProps.prepare = prepare
  } else if (format === 'md') {
    modalProps.toMarkdown = props.toMarkdown
  }

  Modal.add<ModalExportProps<Data, QueryParams>>(markRaw(WModalExport), modalProps)
}
</script>
