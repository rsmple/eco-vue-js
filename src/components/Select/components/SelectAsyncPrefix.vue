<template>
  <template v-if="valueInString.length !== 0">
    <SelectAsyncPrefixPage
      :use-query-fn="useQueryFn"
      :query-params="({page: 1, [valueQueryKey]: valueInString} as QueryParams)"
      :option-component="(optionComponent as SelectOptionComponent<Data>)"
      :option-component-props="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
      :disable-clear="disableClear"
      :loading="loading"
      :disabled="disabled"
      :preview-data="previewData"
      :created-data="createdData"
      :value-getter="valueGetter"
      @unselect="$emit('unselect', $event)"
      @update:fetching="$emit('update:fetching', $event)"
    >
      <template
        v-if="$slots.default"
        #default="{option, skeleton, index}"
      >
        <slot
          :option="option"
          :index="index"
          :skeleton="skeleton"
        />
      </template>
    </SelectAsyncPrefixPage>

    <div
      v-if="modelValue.length > PAGE_LENGTH"
      class="text-accent flex items-center gap-1 overflow-hidden px-1"
    >
      <div>... {{ numberFormatter.format(modelValue.length) }} items</div>

      <WButtonUnselect
        v-if="!disableClear"
        :loading="loading"
        :disabled="disabled"
        @mousedown.stop.prevent=""
        @click.stop.prevent="!loading && $emit('update:modelValue', [])"
      />
    </div>
  </template>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectAsyncPrefixProps, SelectOptionComponent, SelectOptionComponentProps} from '../types'

import {computed, onBeforeUnmount, ref, watch} from 'vue'

import WButtonUnselect from '@/components/Button/WButtonUnselect.vue'

import {numberFormatter} from '@/utils/utils'

import SelectAsyncPrefixPage from './SelectAsyncPrefixPage.vue'

const PAGE_LENGTH = 8

const props = defineProps<SelectAsyncPrefixProps<Model, Data, QueryParams, OptionComponent>>()

const emit = defineEmits<{
  (e: 'unselect', value: Model): void
  (e: 'update:fetching', value: boolean): void
  (e: 'update:modelValue', value: Model[]): void
}>()

const hasFetching = ref(false)

const valueInString = computed(() => props.modelValue.slice(0, PAGE_LENGTH).join(','))

watch(hasFetching, value => {
  emit('update:fetching', value)
}, {immediate: true})

defineSlots<{
  default?: (props: {option: Data, skeleton: boolean, index: number}) => void
}>()

onBeforeUnmount(() => {
  emit('update:fetching', false)
})
</script>