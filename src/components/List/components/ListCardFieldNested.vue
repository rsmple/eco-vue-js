<template>
  <template
    v-for="field in fields"
    :key="getFirstFieldLabel(field)"
  >
    <template v-if="'fields' in field">
      <div
        v-if="'keyArray' in field"
        :class="field.cssClassArray"
        class="sm:mr-6"
      >
        <div
          v-for="inner in item[field.keyArray]"
          :key="(inner as Data).id"
          :class="field.cssClass"
          class="flex"
        >
          <ListCardFieldNested
            :fields="(field.fields as ListFields<Data, QueryParams>)"
            :item="(inner as Data)"
          >
            <template #default="defaultScope">
              <slot v-bind="defaultScope" />
            </template>
          </ListCardFieldNested>
        </div>
      </div>

      <div
        v-else
        :class="field.cssClass"
        class="flex sm:mr-6"
      >
        <ListCardFieldNested
          :fields="(field.fields as ListFields<Data, QueryParams>)"
          :item="'keyEntity' in field ? (item[field.keyEntity] as Data) : item"
        >
          <template #default="defaultScope">
            <slot v-bind="defaultScope" />
          </template>
        </ListCardFieldNested>
      </div>
    </template>

    <slot
      v-else
      :field="field"
      :item="item"
    />
  </template>
</template>

<script setup lang="ts" generic="Data extends DefaultData, QueryParams">
import type {ListField, ListFields} from '../types'
import {getFirstFieldLabel} from '../use/useFieldConfigMap'

defineProps<{
  fields: ListFields<Data, QueryParams>
  item: Data
}>()

defineSlots<{
  default: (props: {field: ListField<Data, QueryParams>, item: Data}) => void
}>()

</script>
