<template>
  <template
    v-for="(field, index) in fields"
    :key="getFirstFieldLabel(field)"
  >
    <template v-if="'fields' in field">
      <HeaderFieldNested :fields="(field.fields as ListFields<Data, QueryParams>)">
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

    <slot
      v-else
      :field="field"
      :nested="false"
      :index="index"
      :length="fields.length"
      :first="index === 0"
      :last="index === fields.length - 1"
    />
  </template>
</template>

<script setup lang="ts" generic="Data, QueryParams">
import type {ListField, ListFields} from '../types'

import {getFirstFieldLabel} from '../use/useFieldConfigMap'

defineProps<{
  fields: ListFields<Data, QueryParams>
}>()

defineSlots<{
  default: (props: {
    field: ListField<Data, QueryParams>
    nested: boolean
    index: number
    length: number
    first: boolean
    last: boolean
  }) => void
}>()
</script>
