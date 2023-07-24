<template>
  <div>
    <WSelect
      ref="selectComponent"
      :model-value="arrayValue"
      :search="search"
      :options="options"
      :title="title"
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
import {computed, ref} from 'vue'
import WSelect from '@/components/Select/WSelect.vue'

const props = defineProps<{
  modelValue: Item | null
  search: string
  options: Item[]
  title?: string
  description?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: VueComponent
  readonly?: boolean
  disabled?: boolean
  skeleton?: boolean
  allowCreate?: boolean
  errorMessage?: string
  hasChanges?: boolean
  placeholder?: string
  persisted?: boolean
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
  emit('update:search', '')

  if (!props.persisted) blur()
}

const createOption = (value: string): void => {
  emit('create:option', value)

  if (!props.persisted) blur()
}

const blur = () => {
  selectComponent.value?.blur()
}

defineExpose({
  blur,
})

</script>
