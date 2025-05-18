<template>
  <template
    v-for="field in fields"
    :key="getFirstFieldLabel(field)"
  >
    <slot
      v-if="isField(field)"
      :field="field"
      :item="item"
      :nested="nested === true"
    />

    <template v-else>
      <template v-if="'keyArray' in field.meta || 'getterArray' in field.meta">
        <component
          :is="field.default ?? 'div'"
          v-bind="field.default ? {item, skeleton, card, readonly} : (undefined as never)"
          :class="field.meta.cssClassArray"
        >
          <ListCardFieldNestedItem :items="skeleton ? [item] : (('keyArray' in field.meta ? item[field.meta.keyArray] : field.meta.getterArray(item)) as Data[])">
            <template #default="{inner, index, last, first}">
              <component
                :is="field.meta.componentItem ?? WEmptyComponent"
                v-bind="field.meta.componentItem ? {item, skeleton, card, index, last, first} : (undefined as never)"
              >
                <div
                  class="flex"
                  :class="field.meta.cssClass"
                >
                  <ListCardFieldNested
                    :fields="(field.meta.fields as ListFields<Data, QueryParams>)"
                    :item="inner"
                    :skeleton="skeleton"
                    :card="card"
                    :readonly="readonly"
                    nested
                  >
                    <template #default="defaultScope">
                      <slot v-bind="defaultScope" />
                    </template>
                  </ListCardFieldNested>
                </div>
              </component>
            </template>
          </ListCardFieldNestedItem>
        </component>
      </template>

      <component
        :is="field.default ?? 'div'"
        v-else
        v-bind="field.default ? {item, skeleton, card, readonly} : (undefined as never)"
        :class="field.meta.cssClass"
        class="flex"
      >
        <ListCardFieldNested
          :fields="(field.meta.fields as ListFields<Data, QueryParams>)"
          :item="'keyEntity' in field.meta ? (item[field.meta.keyEntity] as Data) : 'getterEntity' in field.meta ? (field.meta.getterEntity(item) as Data) : item"
          :skeleton="skeleton"
          :card="card"
          :readonly="readonly"
          nested
        >
          <template #default="defaultScope">
            <slot v-bind="defaultScope" />
          </template>
        </ListCardFieldNested>
      </component>
    </template>
  </template>
</template>

<script setup lang="ts" generic="Data extends DefaultData, QueryParams">
import type {FieldComponent, ListField, ListFieldExport, ListFields} from '../types'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import ListCardFieldNestedItem from './ListCardFieldNestedItem.vue'

import {isField} from '../models/utils'
import {getFirstFieldLabel} from '../use/useListConfig'

defineProps<{
  fields: ListFields<Data, QueryParams>
  item: Data
  nested?: boolean
  skeleton: boolean
  card: boolean
  readonly: boolean
}>()

defineSlots<{
  default: (props: {field: ListFieldExport<FieldComponent<Data>, ListField<Data, QueryParams>>, item: Data, nested: boolean}) => void
}>()
</script>
