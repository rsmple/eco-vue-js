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
            <button
              class="square-5 relative -my-1 -mr-2 ml-1 flex items-center justify-center rounded-full outline-none"
              :class="{
                'cursor-progress': loading,
                'w-ripple w-ripple-hover cursor-pointer': !loading,
              }"
              @mousedown.stop.prevent=""
              @click.stop.prevent="!loading && $emit('unselect', valueGetter(option))"
            >
              <IconCancel class="square-3" />
            </button>
          </template>
        </component>
      </template>
    </slot>

    <button
      v-if="!optionComponent && !disableClear && !disabled"
      class="square-5 relative flex items-center justify-center rounded-full outline-none"
      :class="{
        'cursor-progress': loading,
        'w-ripple w-ripple-hover cursor-pointer ': !loading,
      }"
      @mousedown.stop.prevent=""
      @click.stop.prevent="!loading && $emit('unselect', valueGetter(option))"
    >
      <IconCancel class="square-3" />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Model extends string | number, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import type {SelectAsyncPrefixPageProps, SelectOptionComponent, SelectOptionComponentProps} from '../types'

import {computed, onBeforeUnmount, toRef, watch} from 'vue'

import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

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