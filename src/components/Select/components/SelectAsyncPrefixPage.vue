<template>
  <div
    v-for="(option, index) in options"
    :key="valueGetter(option)"
    class="relative flex overflow-hidden items-center text-description"
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
              class="relative flex square-5 rounded-full -my-1 -mr-2 ml-1 items-center justify-center outline-none"
              :class="{
                'cursor-progress': loading,
                'cursor-pointer w-ripple w-ripple-hover': !loading,
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
      class="relative flex square-5 rounded-full items-center justify-center outline-none"
      :class="{
        'cursor-progress': loading,
        'cursor-pointer w-ripple w-ripple-hover ': !loading,
      }"
      @mousedown.stop.prevent=""
      @click.stop.prevent="!loading && $emit('unselect', valueGetter(option))"
    >
      <IconCancel class="square-3" />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Model extends string | number, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import {computed, toRef, watch, onBeforeUnmount} from 'vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import type {SelectAsyncPrefixPageProps, SelectOptionComponent, SelectOptionComponentProps} from '../types'

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