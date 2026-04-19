import type {ColumnData, FieldConfig, FieldProps, ListFields} from '../types'

import {type Component, type FunctionalComponent, type VNode, h} from 'vue'

import WEmptyComponent from '@/components/EmptyComponent/WEmptyComponent.vue'

import ListCardFieldNestedItem from './ListCardFieldNestedItem.vue'

import {isField} from '../models/utils'
import {getFirstFieldLabel, sortFields} from '../use/useListConfig'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: ListFields<any, any>
  fieldConfigMap: Record<string, FieldConfig>
  columnDataMap: Record<string, ColumnData>
  item: unknown
  skeleton: boolean
  card: boolean
  readonly: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonlyGetter?: (item: any) => boolean
  uniformScope: unknown
  queryParams: unknown
  results: unknown[] | undefined
  intersecting: boolean
  beforeClass: Record<string, boolean | undefined>
  nested?: boolean
}

type Emits = {
  'update:item': [value: unknown]
  'delete:item': []
}

const fakeConfig: FieldConfig = {width: null, visible: true, order: 0, sticky: false}

const renderFields = (
  props: Props,
  onUpdate: (value: unknown) => void,
  onDelete: () => void,
): VNode[] => {
  const sorted = props.card ? props.fields : sortFields(props.fields, props.fieldConfigMap)
  const itemReadonly = props.readonly || (props.readonlyGetter?.(props.item) ?? false)

  return sorted.map(field => {
    if (isField(field)) {
      const label = field.meta.label
      const column = props.columnDataMap[label]!
      const config = props.fieldConfigMap[label]!

      const style = props.card && props.nested ? undefined : column.style
      const cls = column.sticky
        ? {...column.baseClass, ...props.beforeClass}
        : column.baseClass

      return h(field.default as Component, {
        key: label,
        item: props.item,
        readonly: itemReadonly,
        skeleton: props.skeleton,
        card: props.card,
        config,
        uniformScope: props.uniformScope,
        queryParams: props.queryParams,
        results: props.results,
        intersecting: props.intersecting,
        class: [field.meta.cssClass, cls],
        style,
        'onUpdate:item': onUpdate,
        'onDelete:item': onDelete,
      })
    }

    const key = getFirstFieldLabel(field)

    const wrapperBindings = field.default ? {
      item: props.item,
      skeleton: props.skeleton,
      card: props.card,
      readonly: itemReadonly,
      config: fakeConfig,
      uniformScope: props.uniformScope,
      queryParams: props.queryParams,
      results: props.results,
      intersecting: props.intersecting,
    } : undefined

    if ('keyArray' in field.meta || 'getterArray' in field.meta) {
      const meta = field.meta
      const items = props.skeleton
        ? [props.item]
        : 'keyArray' in meta
          ? (props.item as Record<string, unknown[]>)[meta.keyArray as string]!
          : meta.getterArray(props.item as never) as unknown[]

      const componentItem = (meta as {componentItem?: Component}).componentItem

      return h(field.default ?? 'div', {
        key,
        ...wrapperBindings,
        class: meta.cssClassArray,
      } as FieldProps<unknown, unknown>, {
        default: () => h(ListCardFieldNestedItem as unknown as Component, {items}, {
          default: ({inner, index, last, first}: {inner: unknown, index: number, last: boolean, first: boolean}) =>
            h(componentItem ?? WEmptyComponent, componentItem ? {
              item: props.item,
              skeleton: props.skeleton,
              card: props.card,
              index,
              last,
              first,
            } : undefined, {
              default: () => h('div', {class: ['flex', meta.cssClass]},
                renderFields({
                  ...props,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  fields: meta.fields as ListFields<any, any>,
                  item: inner,
                  nested: true,
                }, onUpdate, onDelete),
              ),
            }),
        }),
      })
    }

    const meta = field.meta
    const innerItem = 'keyEntity' in meta
      ? (props.item as Record<string, unknown>)[meta.keyEntity as string]
      : 'getterEntity' in meta
        ? meta.getterEntity(props.item as never)
        : props.item

    return h(field.default ?? 'div', {
      key,
      ...wrapperBindings,
      class: ['flex', meta.cssClass],
    } as FieldProps<unknown, unknown>, {
      default: () => renderFields({
        ...props,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fields: meta.fields as ListFields<any, any>,
        item: innerItem,
        nested: true,
      }, onUpdate, onDelete),
    })
  })
}

const ListCardFieldNested: FunctionalComponent<Props, Emits> = (props, {emit}) => {
  const onUpdate = (value: unknown) => emit('update:item', value)
  const onDelete = () => emit('delete:item')

  return renderFields(props, onUpdate, onDelete)
}

ListCardFieldNested.props = [
  'fields',
  'fieldConfigMap',
  'columnDataMap',
  'item',
  'skeleton',
  'card',
  'readonly',
  'readonlyGetter',
  'uniformScope',
  'queryParams',
  'results',
  'intersecting',
  'beforeClass',
  'nested',
]

ListCardFieldNested.emits = ['update:item', 'delete:item']

export default ListCardFieldNested
