<template>
  <div
    v-for="option in [...createdData ?? [], ...(previewData ?? data?.results ?? [])]"
    :key="valueGetter(option)"
    class="relative flex overflow-hidden items-center text-description"
    :class="{
      'cursor-pointer': !disabled,
      'cursor-not-allowed': disabled,
    }"
  >
    <slot
      :option="option"
      :skeleton="false"
    >
      <template v-if="optionComponent">
        <component
          :is="optionComponent"
          :option="option"
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

<script lang="ts" setup generic="Model extends string | number, Data extends DefaultData, ApiError, QueryParams">
import {computed, toRef, watch, type Component, onBeforeUnmount} from 'vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

const props = defineProps<{
  useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
  queryParams: QueryParams
  disabled?: boolean
  loading?: boolean
  optionComponent?: Component<{option: Data, selected?: boolean, model?: boolean}>
  disableClear?: boolean
  previewData?: Data[]
  createdData?: Data[]
  valueGetter: (value: Data) => Model
  queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>
}>()

const emit = defineEmits<{
  (e: 'unselect', value: Model): void
  (e: 'update:pages-count', value: number): void
  (e: 'update:fetching', value: boolean): void
}>()

const queryEnabled = computed<boolean>(() => !props.previewData)

const {data, isFetching} = props.useQueryFn(toRef(props, 'queryParams'), {
  ...props.queryOptions ?? {},
  enabled: queryEnabled,
  refetchInterval: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchIntervalInBackground: false,
  refetchOnWindowFocus: false,
})

const pagesCount = computed(() => data.value?.pages_count)

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
  default?: (props: {option: Data, skeleton: boolean}) => void
}>()

</script>