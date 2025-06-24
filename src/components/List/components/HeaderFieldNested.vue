<template>
  <template
    v-for="(field, index) in sortFields(fields, fieldConfigMap)"
    :key="getFirstFieldLabel(field)"
  >
    <slot
      v-if="isField(field)"
      :field="field"
      :nested="false"
      :index="index"
      :length="fields.length"
      :first="index === 0"
      :last="index === fields.length - 1"
    />

    <template v-else>
      <HeaderFieldNested
        :fields="(field.meta.fields as ListFields<Data, QueryParams>)"
        :field-config-map="fieldConfigMap"
      >
        <template #default="defaultScope">
          <slot
            v-if="defaultScope.length !== 1"
            :field="defaultScope.field"
            :nested="true"
            :index="defaultScope.index"
            :length="defaultScope.length"
            :first="defaultScope.first"
            :last="defaultScope.last"
          />

          <slot
            v-else
            :field="defaultScope.field"
            :nested="true"
            :index="index"
            :length="fields.length"
            :first="index === 0"
            :last="index === fields.length - 1"
          />
        </template>
      </HeaderFieldNested>
    </template>
  </template>
</template>

<script setup lang="ts" generic="Data, QueryParams">
import type {FieldComponent, FieldConfig, ListField, ListFieldExport, ListFields} from '../types'

import {isField} from '../models/utils'
import {getFirstFieldLabel, sortFields} from '../use/useListConfig'

defineProps<{
  fields: ListFields<Data, QueryParams>
  fieldConfigMap: Record<string, FieldConfig>
}>()

defineSlots<{
  default: (props: {
    field: ListFieldExport<FieldComponent<Data>, ListField<Data, QueryParams>>
    nested: boolean
    index: number
    length: number
    first: boolean
    last: boolean
  }) => void
}>()
</script>
