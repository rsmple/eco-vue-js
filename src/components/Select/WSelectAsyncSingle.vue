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
      :query-params="queryParams"
      :use-query-fn="(useQueryFn as unknown as UsePaginatedQuery<DefaultData>)"
      :is-invalid-page="isInvalidPage"
      :option-component="(optionComponent as unknown as Component<{option: DefaultData, selected?: boolean, model?: boolean}>)"
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
      disable-clear
      hide-prefix
      @select="updateModelValue($event)"
      @unselect="updateModelValue($event)"
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

<script lang="ts" setup generic="Data extends DefaultData">
import {computed, ref, toRef, watch, type Component} from 'vue'
import WSelectAsync from '@/components/Select/WSelectAsync.vue'

const props = defineProps<{
  modelValue: number | null
  search: string
  useQueryFn: UsePaginatedQuery<Data>
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
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'update:search', value: string): void
  (e: 'create:option', value: string): void
}>()

const selectComponent = ref<ComponentInstance<typeof WSelectAsync<Data>> | undefined>()

const arrayValue = computed<number[]>(() => props.modelValue ? [props.modelValue] : [])

const updateModelValue = (value: number): void => {
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
