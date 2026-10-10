<template>
  <WExpansionItem
    v-if="!getMetaValue(meta.hidden, scope.modelValue) && !fields.some(field => disabledFilterFields.includes(field))"
    :title="getMetaValue(meta.title, scope.modelValue)"
    :icon="getMetaValue(meta.icon, scope.modelValue)"
    :is-open="isOpen"
    :has-flag="hasChanges"
    @toggle="$emit('toggle')"
  >
    <component
      :is="item[0].default"
      v-if="Array.isArray(item)"
      v-bind="item[1]"
      :scope="scope"
      :readonly="readonly"
      global
    />

    <component
      :is="item.default"
      v-else
      :scope="scope"
      :readonly="readonly"
      global
    />

    <WButton
      v-if="removeLabel !== undefined"
      :semantic-type="SemanticType.SECONDARY"
      class="mt-4 w-full"
      @click="$emit('remove')"
    >
      {{ removeLabel }}
    </WButton>

    <WButton
      v-else-if="!readonly && hasChanges"
      :semantic-type="SemanticType.SECONDARY"
      :disabled="!hasChanges"
      class="mt-4 w-full"
      @click="scope.updateModelValue({...scope.modelValue, ...getDefaultQuery()})"
    >
      Reset
    </WButton>
  </WExpansionItem>
</template>

<script setup lang="ts" generic="QueryParams">
import type {FilterComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'

import {computed} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WExpansionItem from '@/components/Expansion/WExpansionItem.vue'

import {SemanticType} from '@/utils/SemanticType'

import {getMetaValue} from '../models/utils'

const props = defineProps<{
  scope: UniformScope<QueryParams>
  item: FilterComponent<QueryParams>
  isOpen: boolean
  disabledFilterFields: Array<keyof QueryParams>
  readonly: boolean
  /** Label of a button that takes the filter off the list, shown instead of the reset button. */
  removeLabel?: string
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'remove'): void
}>()

const meta = computed(() => Array.isArray(props.item) ? props.item[0].meta : props.item.meta)

const fields = computed(() => meta.value.fields ?? [])

const hasChanges = computed(() => fields.value.some(field => field in (props.scope.modelValue as Record<string, unknown>)))

const getDefaultQuery = (): Partial<Record<keyof QueryParams, undefined>> => {
  return fields.value.reduce<Partial<Record<keyof QueryParams, undefined>>>((result, field) => {
    result[field] = undefined
    return result
  }, {}) ?? {}
}

defineExpose({
  hasChanges,
  getDefaultQuery,
})
</script>