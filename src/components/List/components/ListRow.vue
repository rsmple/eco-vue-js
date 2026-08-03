<template>
  <component
    :is="uniformField !== undefined ? WUniform : WEmptyComponent"
    v-bind="formFieldGetter ? {
      ...uniformScope ?? {},
      field: uniformField,
    } : undefined"
  >
    <template #default="innerScope">
      <WListCard
        :disabled="skeleton"
        :disable-more="disableMore"
        :mobile="mobile"
        :card-class="cardClass"
        :card-wrapper-class="cardWrapperClass"
        :has-border="hasBorder"
        :allow-open="allowOpen && !skeleton"
        :align-top="alignTop"
        :card="card"
        :to="skeleton ? undefined : cardTo?.(item)"
        :has-action="hasAction"
        :skeleton="skeleton"
        :position="position"
        :content-visibility="contentVisibility"

        :selected="selected"
        :allow-select="allowSelect"
        :allow-select-hover="allowSelectHover"
        :always-select="alwaysSelect"
        @toggle:selected="$emit('toggle:selected', value, position)"
        @hover:selected="$emit('hover:selected', position)"
        @click:action="$emit('click:action', {item, setter, scope: uniformField !== undefined ? innerScope : undefined})"
      >
        <template #default="{beforeClass}">
          <ListCardFieldNested
            :fields="fields"
            :column-data-map="columnDataMap"
            :item="item"
            :skeleton="skeleton"
            :card="card"
            :readonly="isReadonly"
            :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
            :query-params="queryParams"
            :results="results"
            :intersecting="intersecting"
          >
            <template #default="defaultScope">
              <ListCardFieldItem
                :field="defaultScope.field"
                :item="defaultScope.item"
                :nested="defaultScope.nested"
                :column="defaultScope.column"
                :config="fieldConfigMap[defaultScope.field.meta.label]!"
                :readonly="readonly || (readonlyGetter?.(defaultScope.item as Data) ?? false)"
                :skeleton="skeleton"
                :card="card"
                :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
                :query-params="queryParams"
                :results="results"
                :intersecting="intersecting"
                :position="position"
                :before-class="defaultScope.column.sticky ? beforeClass : undefined"
                @update:item="setter"
                @delete:item="setter(); refetch()"
              />
            </template>
          </ListCardFieldNested>
        </template>

        <template
          v-if="expansion"
          #expansion
        >
          <component
            :is="expansion"
            :item="item"
            :readonly="isReadonly"
            :skeleton="skeleton"
            :card="card"
            :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
            :query-params="queryParams"
            :results="results"
            :intersecting="intersecting"
            @update:item="setter"
            @delete:item="setter(); refetch()"
          />
        </template>

        <template
          v-if="menu || (toMarkdown && !skeleton)"
          #more
        >
          <ListMenuMarkdown
            v-if="toMarkdown && !skeleton"
            :item="item"
            :index="index"
            :to-markdown="toMarkdown"
          />

          <template
            v-for="(menuItem, menuIndex) in menu"
            :key="menuIndex"
          >
            <component
              :is="Array.isArray(menuItem) ? menuItem[0] : menuItem"
              v-bind="Array.isArray(menuItem) ? menuItem[1] : undefined"
              :item="item"
              :readonly="isReadonly"
              :uniform-scope="(formFieldGetter as Function | undefined) ? innerScope : undefined"
              :update-item="setter"
              :delete-item="() => {
                setter()
                refetch()
              }"
              @update:item="setter"
              @delete:item="setter(); refetch()"
            />
          </template>
        </template>
      </WListCard>
    </template>
  </component>
</template>

<script lang="ts" setup generic="Data extends DefaultData, QueryParams">
import type {CardActionParams, ColumnData, ExpansionComponent, FieldConfig, ListFields, MenuComponent} from '../types'
import type {UniformScope} from '@/components/Uniform/types'
import type {LinkProps} from '@/types/types'

import {computed} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'
import WUniform from '@/components/Uniform/WUniform.vue'

import ListCardFieldItem from './ListCardFieldItem.vue'
import ListCardFieldNested from './ListCardFieldNested.vue'
import ListMenuMarkdown from './ListMenuMarkdown.vue'

import WListCard from '../WListCard.vue'

const props = defineProps<{
  item: Data
  skeleton: boolean
  setter: (newItem?: Data | undefined) => void
  refetch: () => void
  index: number
  position: number
  value: number
  results: Data[] | undefined
  intersecting: boolean

  fields: ListFields<Data, QueryParams>
  fieldConfigMap: Record<string, FieldConfig>
  columnDataMap: Record<string, ColumnData>
  queryParams: QueryParams
  readonly: boolean
  readonlyGetter: ((item: Data) => boolean) | undefined
  formFieldGetter: ((data: Data, index: number) => string | undefined) | undefined
  uniformScope: UniformScope<Data[]> | undefined
  expansion: ExpansionComponent<Data, QueryParams> | undefined
  menu: MenuComponent<Data>[] | undefined
  toMarkdown: ((data: Data, index: number) => string) | undefined

  card: boolean
  mobile: boolean
  cardClass: string | undefined
  cardWrapperClass: string | undefined
  hasBorder: boolean | undefined
  alignTop: boolean | undefined
  allowOpen: boolean
  disableMore: boolean | undefined
  hasAction: boolean | undefined
  cardTo: ((item: Data) => LinkProps['to'] | undefined) | undefined
  contentVisibility: boolean | undefined

  selected: boolean
  allowSelect: boolean
  allowSelectHover: boolean
  alwaysSelect: boolean
}>()

defineEmits<{
  (e: 'toggle:selected', value: number, position: number): void
  (e: 'hover:selected', position: number): void
  (e: 'click:action', value: CardActionParams<Data>): void
}>()

const uniformField = computed(() => props.formFieldGetter?.(props.item, props.index))

const isReadonly = computed(() => props.readonly || (props.readonlyGetter?.(props.item) ?? false))
</script>
