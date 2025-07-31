<template>
  <SelectOptionPrefix
    v-for="(option, index) in options"
    :key="valueGetter(option)"
    :option="option"
    :option-component="(optionComponent as SelectOptionComponent<Data>)"
    :option-component-props="(optionComponentProps)"
    :index="index"
    :loading="loading"
    :disabled="disabled"
    :readonly="readonly"
    :disable-clear="disableClear"
    :skeleton="queryEnabled && !data"
    :search="undefined"
    :class="{
      'cursor-pointer': !disabled && !readonly,
      'cursor-not-allowed opacity-50': disabled,
    }"
    @unselect="$emit('unselect', valueGetter(option))"
  >
    <template
      v-if="$slots.option"
      #option="scope"
    >
      <slot
        name="option"
        v-bind="scope"
        :index="index"
      />
    </template>
  </SelectOptionPrefix>
</template>

<script lang="ts" setup generic="Model extends string | number, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectAsyncPrefixPageProps, SelectOptionComponent} from '../types'

import {computed, onBeforeUnmount, toRef, watch} from 'vue'

import SelectOptionPrefix from './SelectOptionPrefix.vue'

const props = defineProps<SelectAsyncPrefixPageProps<Model, Data, QueryParams, OptionComponent>>()

const emit = defineEmits<{
  (e: 'unselect', value: Model): void
  (e: 'update:pages-count', value: number): void
  (e: 'update:fetching', value: boolean): void
}>()

const queryEnabled = computed<boolean>(() => !props.previewData)

const {data, isFetching} = props.useQueryFn(toRef(props, 'queryParams'), {
  enabled: queryEnabled,
  refetchInterval: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: false,
})

const pagesCount = computed(() => data.value?.pages_count)

const options = computed<Data[]>(() => {
  if (!props.createdData) return props.previewData ?? data.value?.results ?? []

  return [
    ...props.createdData ?? [],
    ...(props.previewData ?? data.value?.results ?? []),
  ].filter((option, index, array) => array.findIndex(item => props.valueGetter(item) === props.valueGetter(option)) === index)
})

watch(pagesCount, value => {
  if (value === undefined) return

  emit('update:pages-count', value)
})

watch(isFetching, (value: boolean) => {
  emit('update:fetching', value)
}, {immediate: true})

onBeforeUnmount(() => {
  emit('update:fetching', false)
})

defineSlots<{
  option?: (props: {option: Data | undefined, index: number, skeleton: boolean}) => void
}>()
</script>