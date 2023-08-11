<template>
  <div>
    <WSelect
      ref="selectComponent"
      :model-value="arrayValue"
      :search="search"
      :options="options"
      :title="title"
      :mobile-title="mobileTitle"
      :description="description"
      :loading="loading"
      :max-search-length="maxSearchLength"
      :empty-stub="emptyStub"
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
      disable-clear
      hide-prefix
      @select="updateModelValue($event as Item)"
      @unselect="updateModelValue($event as Item)"
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

      <template #right>
        <slot name="right" />
      </template>
    </WSelect>
  </div>
</template>

<script lang="ts" setup generic="Item extends string | number = string">
import {computed, ref, toRef, watch, type Component} from 'vue'
import WSelect from '@/components/Select/WSelect.vue'

const props = defineProps<{
  modelValue: Item | null
  search: string
  options: Item[]
  title?: string
  mobileTitle?: string
  description?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: Component<{option: Item, selected?: boolean, model?: boolean}>
  readonly?: boolean
  disabled?: boolean
  skeleton?: boolean
  allowCreate?: boolean
  errorMessage?: string
  hasChanges?: boolean
  placeholder?: string
  searchSize?: number
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item): void
  (e: 'update:search', value: string): void
  (e: 'create:option', value: string): void
}>()

const selectComponent = ref<ComponentInstance<typeof WSelect<Item>> | undefined>()

const arrayValue = computed<Item[]>(() => props.modelValue ? [props.modelValue] : [])

const updateModelValue = (value: Item): void => {
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
