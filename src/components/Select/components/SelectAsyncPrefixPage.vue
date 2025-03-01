<template>
  <div
    v-for="(option, index) in options"
    :key="valueGetter(option)"
    class="text-description relative flex items-center overflow-hidden"
    :class="{
      'cursor-pointer': !disabled,
      'cursor-not-allowed': disabled,
    }"
  >
    <slot
      :option="option"
      :index="index"
      :skeleton="false"
    >
      <template v-if="optionComponent">
        <component
          v-bind="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
          :is="(optionComponent as SelectOptionComponent<Data>)"
          :option="option"
          :index="index"
          :selected="true"
          :model="true"
          :skeleton="false"
        >
          <template
            v-if="!disableClear && !disabled"
            #default
          >
            <WButtonUnselect
              :loading="loading"
              :disabled="disabled"
              class="w-option-button ml-1 mr-2"
              @mousedown.stop.prevent=""
              @click.stop.prevent="!loading && $emit('unselect', valueGetter(option))"
            />
          </template>
        </component>
      </template>
    </slot>

    <WButtonUnselect
      v-if="!optionComponent && !disableClear"
      :loading="loading"
      :disabled="disabled"
      class="ml-1 mr-2"
      @mousedown.stop.prevent=""
      @click.stop.prevent="!loading && $emit('unselect', valueGetter(option))"
    />
  </div>
</template>

<script lang="ts" setup generic="Model extends string | number, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectAsyncPrefixPageProps, SelectOptionComponent, SelectOptionComponentProps} from '../types'

import {computed, onBeforeUnmount, toRef, watch} from 'vue'

import WButtonUnselect from '@/components/Button/WButtonUnselect.vue'

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
  default?: (props: {option: Data, skeleton: boolean, index: number}) => void
}>()
</script>