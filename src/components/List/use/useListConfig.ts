import type {FieldConfig, FieldConfigMap, ListField, ListFields} from '../types'

import {type MaybeRef, computed, isRef, markRaw, ref, unref, watch} from 'vue'

import IconGrid from '@/assets/icons/sax/IconGrid.svg?component'
import IconTable from '@/assets/icons/sax/IconTable.svg?component'

export enum ListMode {
  TABLE = 'table',
  GRID = 'grid',
}

export const listModeList = [
  ListMode.TABLE,
  ListMode.GRID,
]

const isListMode = (value: unknown): value is ListMode => {
  return typeof value === 'string' && listModeList.includes(value as ListMode)
}

const parseListMode = (value: unknown): ListMode => {
  return isListMode(value) ? value : ListMode.TABLE
}

export const listModeIconMap: Record<ListMode, SVGComponent> = {
  [ListMode.TABLE]: markRaw(IconTable),
  [ListMode.GRID]: markRaw(IconGrid),
}

export type ListConfig<Fields extends ListFields<unknown>> = {
  fields: FieldConfigMap<Fields>
  mode: ListMode
}

const fieldConfigKeyLength: ObjectKeys<FieldConfig>['length'] = 3

const isFieldConfig = (value: unknown): value is Partial<FieldConfig> => {
  return value instanceof Object
    && Object.keys(value).length <= fieldConfigKeyLength
    && (!('width' in value) || value.width === null || typeof value.width === 'number')
    && (!('visible' in value) || typeof value.visible === 'boolean')
    && (!('order' in value) || typeof value.order === 'number')
}

const parseFieldConfigMap = <Fields extends ListFields<unknown>>(value: unknown, fields: Fields, defaultConfigMap: FieldConfigMap<Fields>): FieldConfigMap<Fields> => {
  const configMap: Record<string, FieldConfig> = {}

  const processFields = (fieldList: ListFields<unknown>) => {
    fieldList.forEach(field => {
      if ('fields' in field) {
        processFields(field.fields as ListFields<unknown>)
        return
      }

      const config = value instanceof Object && field.label in value ? value[field.label as keyof typeof value] : undefined
      const defaultConfig = defaultConfigMap[field.label as keyof typeof defaultConfigMap]

      if (!isFieldConfig(config)) {
        configMap[field.label] = {...defaultConfig}
      } else {
        configMap[field.label] = {
          width: config.width ?? null,
          visible: config.visible ?? defaultConfig.visible,
          order: config.order ?? defaultConfig.order,
        }
      }
    })
  }

  processFields(fields)

  Object.values<FieldConfig>(configMap)
    .sort((a, b) => a.order - b.order)
    .forEach((item, index) => {
      item.order = index
    })

  return configMap as FieldConfigMap<Fields>
}

const parseListConfig = <Fields extends ListFields<unknown>>(value: unknown, fields: Fields, defaultConfigMap: FieldConfigMap<Fields>): ListConfig<Fields> => {
  return {
    fields: parseFieldConfigMap(value instanceof Object && 'fields' in value ? value.fields : undefined, fields, defaultConfigMap),
    mode: parseListMode(value instanceof Object && 'mode' in value ? value.mode : undefined),
  }
}

const getListConfig = (key: string): unknown | undefined => {
  const value = localStorage.getItem(key)

  if (typeof value !== 'string') return undefined

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterFields = <F extends ListFields<any, any>>(fields: F, method: (field: ListField<unknown>) => boolean): F => {
  return fields.reduce<F>((result, field) => {
    if ('fields' in field) {
      const fields = filterFields(field.fields, method)

      if (fields.length) result.push({...field, fields})
    } else if (method(field)) result.push(field)

    return result
  }, [] as unknown as F)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFirstFieldLabel = <F extends ListFields<any, any>[number]>(field: F): string => {
  return 'label' in field ? field.label : getFirstFieldLabel(field.fields[0])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useListConfig = <Fields extends ListFields<any, any>>(key: MaybeRef<string>, fields: MaybeRef<Fields>, defaultConfigMap: MaybeRef<FieldConfigMap<Fields>>) => {
  const value = ref<ListConfig<Fields>>(
    parseListConfig(
      getListConfig(unref(key)),
      unref(fields),
      unref(defaultConfigMap),
    ),
  )
  const hasSaved = ref(localStorage.getItem(unref(key)) !== null)

  const listConfig = computed<ListConfig<Fields>>(() => value.value as ListConfig<Fields>)
  const fieldConfigMap = computed<Record<string, FieldConfig>>({
    get: () => value.value.fields as Record<string, FieldConfig>,
    set: newValue => {
      value.value.fields = newValue as typeof value.value.fields

      save()
    },
  })

  const isGrid = computed(() => value.value.mode === ListMode.GRID)

  const reset = () => {
    value.value = parseListConfig(undefined, unref(fields), unref(defaultConfigMap))
    hasSaved.value = false
    localStorage.removeItem(unref(key))
  }

  const save = () => {
    localStorage.setItem(unref(key), JSON.stringify(value.value))
    hasSaved.value = true
  }

  const updateMode = (mode: ListMode) => {
    value.value.mode = mode

    save()
  }

  if (isRef(key)) {
    watch(key, newKey => {
      value.value = parseListConfig(getListConfig(unref(newKey)), unref(fields), unref(defaultConfigMap))
      hasSaved.value = localStorage.getItem(unref(key)) !== null
    })
  }

  if (isRef(defaultConfigMap)) watch(defaultConfigMap, newValue => {
    value.value = parseListConfig(getListConfig(unref(key)), unref(fields), newValue)
    hasSaved.value = localStorage.getItem(unref(key)) !== null
  })

  return {
    listConfig,
    fieldConfigMap,
    isGrid,
    hasSaved,
    reset,
    save,
    updateMode,
  }
}
