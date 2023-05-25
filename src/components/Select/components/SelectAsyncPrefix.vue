<template>
  <template v-if="idInString.length !== 0">
    <SelectAsyncPrefixPage
      v-for="page in pagesCount"
      :key="page"
      :use-query-fn="useQueryFn"
      :query-params="{page, id__in: idInString}"
      :option-component="optionComponent"
      :disable-clear="disableClear"
      :loading="loading"
      :disabled="disabled"
      @update:pages-count="pagesCount = $event"
      @unselect="$emit('unselect', $event)"
      @update:fetching="fetchingMap[page] = $event"
    >
      <template #default="{option, skeleton}">
        <slot
          :option="option"
          :skeleton="skeleton"
        />
      </template>
    </SelectAsyncPrefixPage>
  </template>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import type {UseDefaultQueryFn} from '@/components/InfiniteList/models/types'
import SelectAsyncPrefixPage from './SelectAsyncPrefixPage.vue'

const props = defineProps<{
  useQueryFn: UseDefaultQueryFn
  modelValue: number[]
  disabled?: boolean
  loading?: boolean
  optionComponent?: VueComponent
  disableClear?: boolean
}>()

const emit = defineEmits<{
  (e: 'unselect', value: number): void
  (e: 'update:fetching', value: boolean): void
}>()

const pagesCount = ref(1)

const fetchingMap = ref<Record<number, boolean>>({})
const hasFetching = computed(() => {
  return Object.values(fetchingMap.value).includes(true)
})

const idInString = computed(() => props.modelValue.join(','))

watch(hasFetching, value => {
  emit('update:fetching', value)
})

</script>