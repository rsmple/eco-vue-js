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
      :query-options="queryOptions"
      @unselect="$emit('unselect', $event)"
      @update:fetching="$emit('update:fetching', $event)"
    >
      <template #default="{option, skeleton, index}">
        <slot
          :option="option"
          :index="index"
          :skeleton="skeleton"
        />
      </template>
    </SelectAsyncPrefixPage>

    <div
      v-if="modelValue.length > PAGE_LENGTH"
      class="flex overflow-hidden items-center text-accent gap-1 px-1"
    >
      <div>... {{ numberFormatter.format(modelValue.length) }} items</div>

      <button
        v-if="!disableClear && !disabled"
        class="relative flex square-5 rounded-full items-center justify-center outline-none"
        :class="{
          'cursor-progress': loading,
          'cursor-pointer w-ripple w-ripple-hover ': !loading,
        }"
        @mousedown.stop.prevent=""
        @click.stop.prevent="!loading && $emit('update:modelValue', [])"
      >
        <IconCancel class="square-3" />
      </button>
    </div>
  </template>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import {computed, ref, watch, onBeforeUnmount} from 'vue'
import SelectAsyncPrefixPage from './SelectAsyncPrefixPage.vue'
import {numberFormatter} from '@/utils/utils'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import type {SelectAsyncPrefixProps, SelectOptionComponent, SelectOptionComponentProps} from '../types'

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