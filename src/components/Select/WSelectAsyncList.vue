<template>
  <div>
    <div
      v-if="title"
      class="text-lg text-accent font-semibold mb-2"
    >
      <WSkeleton v-if="skeleton" />
      
      <template v-else>
        {{ title }}
      </template>
    </div>

    <WSkeleton
      v-if="skeleton"
      class="w-skeleton-rounded-2xl h-[24rem] min-w-full"
    />

    <div
      v-else
      ref="list"
      class="h-[24rem] overflow-y-overlay border border-gray-300 dark:border-gray-700 border-solid rounded-2xl"
    >
      <SelectAsyncList
        :model-value="modelValue"
        :use-query-fn="useQueryFn"
        :is-invalid-page="isInvalidPage"
        :query-params="queryParams"
        :scrolling-element="list"
        :exclude-params="['id__in']"
        :empty-stub="emptyStub"
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

<script lang="ts" setup>
import {ref} from 'vue'
import SelectAsyncList from './components/SelectAsyncList.vue'
import type {QueryParams, UseDefaultQueryFn} from '@/components/InfiniteList/models/types'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

defineProps<{
  title?: string
  emptyStub?: string
  modelValue: number[]
  useQueryFn: UseDefaultQueryFn
  isInvalidPage: (error: unknown) => boolean
  queryParams: QueryParams
  skeleton?: boolean
}>()

defineEmits<{
  (e: 'select', value: number): void
  (e: 'unselect', value: number): void
  (e: 'update:model-value', value: number[]): void
  (e: 'update:count', value: number): void
}>()

const list = ref<HTMLDivElement | undefined>()

</script>