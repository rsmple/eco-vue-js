<template>
  <div>
    <div
      v-if="title"
      class="text-accent mb-2 text-xs font-semibold"
    >
      <WSkeleton v-if="skeleton" />
      
      <template v-else>
        {{ title }}
      </template>
    </div>

    <WSkeleton
      v-if="skeleton"
      class="w-skeleton-rounded-2xl w-skeleton-h-[24rem] w-skeleton-w-full"
    />

    <div
      v-else
      ref="list"
      class="overflow-y-overlay sm-not:border-y h-96 border-solid border-gray-300 sm:rounded-2xl sm:border dark:border-gray-700"
    >
      <SelectAsyncList
        :model-value="modelValue"
        :use-query-fn="useQueryFn"
        :query-params="(queryParams as QueryParams)"
        :scrolling-element="listRef"
        :exclude-params="excludeParams"
        :empty-stub="emptyStub"
        :select-only="selectOnly"
        :unselect-only="unselectOnly"
        :hide-option-icon="hideOptionIcon"
        :value-getter="valueGetter"
        :query-options="queryOptions"
        allow-update-selected
        transition
        no-padding
        @select="$emit('select', $event)"
        @unselect="$emit('unselect', $event)"
        @update:count="$emit('update:count', $event)"
        @update:model-value="$emit('update:model-value', $event)"
      >
        <template #default="{option, selected, skeleton: skeletonList}">
          <slot
            :option="option"
            :selected="selected"
            :skeleton="skeletonList"
            :model="false"
          />
        </template>
      </SelectAsyncList>
    </div>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import {useTemplateRef} from 'vue'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import SelectAsyncList from './components/SelectAsyncList.vue'

withDefaults(
  defineProps<{
    title?: string
    emptyStub?: string
    modelValue: Model[]
    useQueryFn: UseQueryPaginated<Data, QueryParams>
    queryParams: QueryParams
    skeleton?: boolean
    excludeParams?: (keyof QueryParams)[]
    selectOnly?: boolean
    unselectOnly?: boolean
    hideOptionIcon?: boolean
    valueGetter?: (data: Data) => Model
    queryOptions?: Partial<Parameters<UseQueryPaginated<Data, QueryParams>>[1]>
  }>(),
  {
    title: undefined,
    emptyStub: undefined,
    excludeParams: undefined,
    valueGetter: (data: Data) => (data.id as Model),
    queryOptions: undefined,
  },
)

defineEmits<{
  (e: 'select', value: Model): void
  (e: 'unselect', value: Model): void
  (e: 'update:model-value', value: Model[]): void
  (e: 'update:count', value: number): void
}>()

const listRef = useTemplateRef('list')

defineSlots<{
  default?: (props: {option: Data | null, selected: boolean, skeleton: boolean, model: boolean}) => void
}>()
</script>