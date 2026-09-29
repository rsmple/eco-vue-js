<template>
  <div>
    <div
      v-if="title"
      class="text-accent mb-2 text-xs font-semibold"
    >
      <WSkeleton v-if="isSkeleton" />
      
      <template v-else>
        {{ title }}
      </template>
    </div>

    <WSkeleton
      v-if="isSkeleton"
      class="w-skeleton-rounded-2xl w-skeleton-h-sm w-skeleton-w-full"
    />

    <WInfiniteListScrollingElement
      v-else
      class="sm-not:border-y h-96 overflow-y-auto border-solid border-gray-300 sm:rounded-2xl sm:border dark:border-gray-700"
    >
      <SelectAsyncList
        :model-value="modelValue"
        :use-query-fn="useQueryFn"
        :query-params="(queryParams as QueryParams)"
        :exclude-params="excludeParams"
        :empty-stub="emptyStub"
        :select-only="selectOnly"
        :unselect-only="unselectOnly"
        :hide-option-icon="hideOptionIcon"
        :value-getter="valueGetter"
        :query-options="queryOptions"
        :disabled="isDisabled || isReadonly"
        transition
        @select="$emit('select', $event)"
        @unselect="$emit('unselect', $event)"
        @update:count="$emit('update:count', $event)"
      >
        <template
          v-if="$slots.default"
          #default="{option, selected, skeleton: skeletonList, index}"
        >
          <slot
            :option="option"
            :selected="selected"
            :skeleton="skeletonList"
            :model="false"
            :index="index"
            :search="undefined"
          />
        </template>
      </SelectAsyncList>
    </WInfiniteListScrollingElement>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams">
import type {SelectOptionProps} from './types'

import WInfiniteListScrollingElement from '@/components/InfiniteList/WInfiniteListScrollingElement.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {useComponentStates} from '@/utils/useComponentStates'

import SelectAsyncList from './components/SelectAsyncList.vue'

const props = withDefaults(
  defineProps<{
    /** Label above the list. */
    title?: string
    /** Text shown when the query returns no options. */
    emptyStub?: string
    /** Picked values. */
    modelValue: Model[]
    /** Paginated query of the options, loaded page by page as the list scrolls. */
    useQueryFn: UseQueryDefault<PaginatedResponse<Data>, QueryParams>
    /** Params of the query, such as a search. */
    queryParams: QueryParams
    /** Shows placeholders instead of the list. When unset, inherits the skeleton state provided by a parent. */
    skeleton?: boolean
    /** Params whose change refetches the loaded pages instead of starting from the first one. */
    excludeParams?: (keyof QueryParams)[]
    /** Only allows picking options, not unpicking them. */
    selectOnly?: boolean
    /** Only allows unpicking options, not picking them. */
    unselectOnly?: boolean
    /** Hides the check icon of the options. */
    hideOptionIcon?: boolean
    /** Value of an option. Defaults to its `id`. */
    valueGetter?: (data: Data) => Model
    /** Options for every page query. */
    queryOptions?: Partial<Parameters<UseQueryDefault<PaginatedResponse<Data>, QueryParams>>[1]>
    /** Stops picking. When unset, inherits the disabled state provided by a parent. */
    disabled?: boolean
    /** Stops picking. When unset, inherits the readonly state provided by a parent. */
    readonly?: boolean
  }>(),
  {
    title: undefined,
    emptyStub: undefined,
    excludeParams: undefined,
    valueGetter: (data: Data) => (data as unknown as {id: Model}).id,
    queryOptions: undefined,
    readonly: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

defineEmits<{
  /** An option was picked. */
  (e: 'select', value: Model): void
  /** An option was unpicked. */
  (e: 'unselect', value: Model): void
  /** Total number of options, from the query's `count`. */
  (e: 'update:count', value: number): void
}>()

const {isReadonly, isDisabled, isSkeleton} = useComponentStates(props)

defineSlots<{
  /** Content of an option, with `skeleton` while its page loads. */
  default?: (props: PartialNot<SelectOptionProps<Data>>) => void
}>()
</script>