<template>
  <div
    v-for="option in data?.results"
    :key="option.id"
    class="relative flex overflow-hidden items-center max-w-[calc(100%-2.75rem)] text-description"
    :class="{
      'cursor-pointer': !disabled,
      'cursor-not-allowed': disabled,
    }"
  >
    <slot
      :option="option"
      :skeleton="!data"
    >
      <template v-if="optionComponent">
        <component
          :is="optionComponent"
          :option="option"
          :selected="true"
          :model="true"
          :skeleton="!data"
        >
          <button
            v-if="!disableClear"
            class="relative flex square-5 rounded-full -my-1 -mr-2 ml-1 items-center justify-center outline-none"
            :class="{
              'cursor-not-allowed': disabled,
              'cursor-progress': loading,
              'cursor-pointer w-ripple w-ripple-hover': !loading && !disabled,
            }"
            @mousedown.stop.prevent=""
            @click.stop.prevent="!loading && $emit('unselect', option.id)"
          >
            <IconCancel class="square-3" />
          </button>
        </component>
      </template>
    </slot>

    <button
      v-if="!optionComponent && !disableClear"
      class="relative flex square-5 rounded-full items-center justify-center outline-none"
      :class="{
        'cursor-not-allowed': disabled,
        'cursor-progress': loading,
        'cursor-pointer w-ripple w-ripple-hover ': !loading && !disabled,
      }"
      @mousedown.stop.prevent=""
      @click.stop.prevent="!loading && $emit('unselect', option.id)"
    >
      <IconCancel class="square-3" />
    </button>
  </div>
</template>

<script lang="ts" setup generic="Data extends DefaultData">
import {computed, toRef, watch} from 'vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

const props = defineProps<{
  useQueryFn: UseDefaultQueryFn<Data>
  queryParams: QueryParams
  disabled?: boolean
  loading?: boolean
  optionComponent?: VueComponent
  disableClear?: boolean
}>()

const emit = defineEmits<{
  (e: 'unselect', value: number): void
  (e: 'update:pages-count', value: number): void
  (e: 'update:fetching', value: boolean): void
}>()

const {data, isFetching} = props.useQueryFn(toRef(props, 'queryParams'))

const pagesCount = computed(() => data.value?.pages_count)

watch(pagesCount, value => {
  if (value === undefined) return

  emit('update:pages-count', value)
})

watch(isFetching, (value: boolean) => {
  emit('update:fetching', value)
})

defineSlots<{
  default?: (props: {option: Data, skeleton: boolean}) => void
}>()

</script>