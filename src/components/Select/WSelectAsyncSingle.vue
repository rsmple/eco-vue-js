<template>
  <div>
    <WSelectAsync
      ref="selectComponent"
      :model-value="arrayValue"
      :search="search"
      :title="title"
      :mobile-title="mobileTitle"
      :description="description"
      :loading="loading"
      :max-search-length="maxSearchLength"
      :empty-stub="emptyStub"
      :query-params="(queryParams as QueryParams)"
      :use-query-fn="useQueryFn"
      :is-invalid-page="isInvalidPage"
      :option-component="optionComponent"
      :readonly="readonly"
      :disabled="disabled"
      :skeleton="skeleton"
      :allow-create="allowCreate"
      :error-message="errorMessage"
      :has-changes="hasChanges"
      :placeholder="placeholder"
      :search-size="searchSize"
      :required="required"
      :no-margin="noMargin"
      :icon="icon"
      :mono="mono"
      :disable-clear="!allowClear"
      :preview-data="previewData ? [previewData] as Data[] : undefined"
      :created-data="createdData ? [createdData] as Data[] : undefined"
      :hide-option-icon="hideOptionIcon"
      :value-getter="valueGetter"
      :value-query-key="valueQueryKey"
      :query-options="queryOptions"
      hide-prefix
      @select="updateModelValue($event)"
      @unselect="allowClear && updateModelValue(null)"
      @update:search="emit('update:search', $event)"
      @create:option="createOption($event)"
    >
      <template #option="{option, selected, model}">
        <slot
          name="option"
          :option="option"
          :selected="selected"
          :model="model"
        />
      </template>

      <template
        v-if="$slots.right?.()?.length"
        #right
      >
        <slot name="right" />
      </template>
    </WSelectAsync>
  </div>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, ApiError, QueryParams">
import {computed, ref, toRef, watch, type Component} from 'vue'
import WSelectAsync from '@/components/Select/WSelectAsync.vue'

const props = defineProps<{
  modelValue: Model | null
  search: string
  useQueryFn: UseQueryPaginated<Data, ApiError, QueryParams>
  isInvalidPage: (error: unknown) => boolean
  queryParams: QueryParams
  title?: string
  mobileTitle?: string
  description?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: Component<{option: Data, selected?: boolean, model?: boolean}>
  readonly?: boolean
  disabled?: boolean
  skeleton?: boolean
  allowCreate?: boolean
  errorMessage?: string
  hasChanges?: boolean
  placeholder?: string
  searchSize?: number
  required?: boolean
  noMargin?: boolean
  icon?: SVGComponent
  mono?: boolean
  allowClear?: boolean
  previewData?: Data
  createdData?: Data
  hideOptionIcon?: boolean
  valueGetter?: (data: Data) => Model
  valueQueryKey?: string
  queryOptions?: Partial<Parameters<UseQueryPaginated<Data, ApiError, QueryParams>>[1]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Model | null): void
  (e: 'update:search', value: string): void
  (e: 'create:option', value: string): void
}>()

const selectComponent = ref<ComponentInstance<typeof WSelectAsync<Model, Data, ApiError, QueryParams>> | undefined>()

const arrayValue = computed<Model[]>(() => props.modelValue ? [props.modelValue] : [])

const updateModelValue = (value: Model | null): void => {
  emit('update:modelValue', value)
}

const createOption = (value: string): void => {
  emit('create:option', value)
}

const blur = () => {
  selectComponent.value?.blur()
  emit('update:search', '')
}

watch(toRef(props, 'modelValue'), blur)

defineExpose({
  blur,
})

</script>
