<template>
  <WDropdownMenu
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.RIGHT_INNER"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconExport)"
        :active="isOpen"
        title="Export"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #content>
      <WClickOutside
        class="bg-default dark:bg-default-dark my-2 grid grid-cols-1 overflow-hidden rounded-xl shadow-md dark:outline dark:outline-1 dark:outline-gray-800"
        @click="isOpen = false"
      >
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
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {ListFields} from '../types'
import type {ModalExportProps} from '@/components/Modal/types'

import {defineAsyncComponent, markRaw, ref} from 'vue'

import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconExport from '@/assets/icons/IconExport.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {Modal} from '@/utils/Modal'

import {buildExportColumns} from '../use/useExportColumns'

const WModalExport = defineAsyncComponent(() => import('@/components/Modal/WModalExport.vue'))

const props = defineProps<{
  fields: ListFields<Data, QueryParams>
  queryParamsGetter: () => QueryParams
  useQueryFn: UseQueryPaginated<Data, QueryParams>
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
