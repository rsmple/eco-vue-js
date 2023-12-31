<template>
  <template v-if="idInString.length !== 0">
    <SelectAsyncPrefixPage
      :use-query-fn="useQueryFn"
      :query-params="{page: 1, id__in: idInString}"
      :option-component="optionComponent"
      :disable-clear="disableClear"
      :loading="loading"
      :disabled="disabled"
      @unselect="$emit('unselect', $event)"
      @update:fetching="$emit('update:fetching', $event)"
    >
      <template #default="{option, skeleton}">
        <slot
          :option="option"
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

<script lang="ts" setup generic="Data extends DefaultData">
import {computed, ref, watch, type Component, onBeforeUnmount} from 'vue'
import SelectAsyncPrefixPage from './SelectAsyncPrefixPage.vue'
import {numberFormatter} from '@/utils/utils'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

const PAGE_LENGTH = 8

const props = defineProps<{
  useQueryFn: UsePaginatedQuery<Data>
  modelValue: number[]
  disabled?: boolean
  loading?: boolean
  optionComponent?: Component<{option: Data, selected?: boolean, model?: boolean}>
  disableClear?: boolean
}>()

const emit = defineEmits<{
  (e: 'unselect', value: number): void
  (e: 'update:fetching', value: boolean): void
  (e: 'update:modelValue', value: number[]): void
}>()

const hasFetching = ref(false)

const idInString = computed(() => props.modelValue.slice(0, PAGE_LENGTH).join(','))

watch(hasFetching, value => {
  emit('update:fetching', value)
}, {immediate: true})

defineSlots<{
  default?: (props: {option: Data, skeleton: boolean}) => void
}>()

onBeforeUnmount(() => {
  emit('update:fetching', false)
})

</script>