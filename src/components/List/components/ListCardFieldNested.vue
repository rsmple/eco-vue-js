<template>
  <template
    v-for="field in fields"
    :key="getFirstFieldLabel(field)"
  >
    <template v-if="'fields' in field">
      <template v-if="'keyArray' in field || 'getterArray' in field">
        <component
          :is="field.componentArray ?? 'div'"
          v-bind="field.componentArray ? {item, skeleton, card} : (undefined as never)"
          :class="field.cssClassArray"
        >
          <ListCardFieldNestedItem :items="skeleton ? [item] : (('keyArray' in field ? item[field.keyArray] : field.getterArray(item)) as Data[])">
            <template #default="{inner, index, last, first}">
              <component
                :is="field.componentItem ?? WEmptyComponent"
                v-bind="field.componentItem ? {item, skeleton, card, index, last, first} : (undefined as never)"
              >
                <div
                  class="flex"
                  :class="field.cssClass"
                >
                  <ListCardFieldNested
                    :fields="(field.fields as ListFields<Data, QueryParams>)"
                    :item="(inner as Data)"
                    :skeleton="skeleton"
                    :card="card"
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

      <div
        v-else
        :class="field.cssClass"
        class="flex"
      >
        <ListCardFieldNested
          :fields="(field.fields as ListFields<Data, QueryParams>)"
          :item="'keyEntity' in field ? (item[field.keyEntity] as Data) : 'getterEntity' in field ? (field.getterEntity(item) as Data) : item"
          :skeleton="skeleton"
          :card="card"
          nested
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

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import ListCardFieldNestedItem from './ListCardFieldNestedItem.vue'

import {getFirstFieldLabel} from '../use/useListConfig'

defineProps<{
  fields: ListFields<Data, QueryParams>
  item: Data
  nested?: boolean
  skeleton: boolean
  card: boolean
}>()

defineSlots<{
  default: (props: {field: ListField<Data, QueryParams>, item: Data}) => void
}>()
</script>
