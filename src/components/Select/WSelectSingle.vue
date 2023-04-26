<template>
  <div>
    <WSelect
      ref="selectComponent"
      :model-value="modelValue ? [modelValue] : []"
      :search="search"
      :options="options"
      :title="title"
      :loading="loading"
      :max-search-length="maxSearchLength"
      :empty-stub="emptyStub"
      :option-component="optionComponent"
      :readonly="readonly"
      :skeleton="skeleton"
      :allow-create="allowCreate"
      :error-message="errorMessage"
      :has-changes="hasChanges"
      disable-clear
      hide-prefix
      @select="updateModelValue($event)"
      @unselect="updateModelValue($event)"
      @update:search="emit('update:search', $event)"
      @create:option="updateModelValue($event)"
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

<script lang="ts" setup>
import {ref} from 'vue'
import WSelect from '@/components/Select/WSelect.vue'

defineProps<{
  modelValue: string | null
  search: string
  options: string[]
  title?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: VueComponent
  readonly?: boolean
  skeleton?: boolean
  allowCreate?: boolean
  errorMessage?: string
  hasChanges?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:search', value: string): void
}>()

const selectComponent = ref<InstanceType<typeof WSelect> | undefined>()

const updateModelValue = (value: string): void => {
  emit('update:modelValue', value)
  emit('update:search', '')

  selectComponent.value?.blur()
}

</script>
