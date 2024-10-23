import {computed, isRef, ref, unref, watch, type MaybeRef} from 'vue'
import type {FieldConfig, FieldConfigMap, ListField} from '../types'

const fieldConfigKeyLength: ObjectKeys<FieldConfig>['length'] = 3

const isFieldConfig = (value: unknown): value is Partial<FieldConfig> => {
  return value instanceof Object
    && Object.keys(value).length <= fieldConfigKeyLength
    && (!('width' in value) || value.width === null || typeof value.width === 'number')
    && (!('visible' in value) || typeof value.visible === 'boolean')
    && (!('order' in value) || typeof value.order === 'number')
}

const parseFieldConfigMap = <Fields extends ListField<unknown>[]>(value: unknown, fields: Fields, defaultConfigMap: FieldConfigMap<Fields>): FieldConfigMap<Fields> => {
  const configMap = fields.reduce<Record<string, FieldConfig>>((result, field) => {
    const config = value instanceof Object && field.label in value ? value[field.label as keyof typeof value] : undefined
    const defaultConfig = defaultConfigMap[field.label as keyof typeof defaultConfigMap]

    if (!isFieldConfig(config)) {
      result[field.label] = {...defaultConfig}
    } else {
      result[field.label] = {
        width: config.width ?? null,
        visible: config.visible ?? defaultConfig.visible,
        order: config.order ?? defaultConfig.order,
      }
    }

    return result
  }, {}) as FieldConfigMap<Fields>

  Object.values<FieldConfig>(configMap)
    .sort((a, b) => a.order - b.order)
    .forEach((item, index) => {
      item.order = index
    })

  return configMap
}

const getFieldConfigMap = (key: string): unknown | undefined => {
  const value = localStorage.getItem(key)

  if (typeof value !== 'string') return undefined

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useFieldConfigMap = <Fields extends ListField<any, any>[]>(key: MaybeRef<string>, fields: MaybeRef<Fields>, defaultConfigMap: MaybeRef<FieldConfigMap<Fields>>) => {
  const value = ref<FieldConfigMap<Fields>>(parseFieldConfigMap(getFieldConfigMap(unref(key)), unref(fields), unref(defaultConfigMap)))
  const hasSaved = ref(localStorage.getItem(unref(key)) !== null)

  const fieldConfigMap = computed<Record<string, FieldConfig>>({
    get: () => value.value,
    set: newValue => {
      value.value = newValue
      localStorage.setItem(unref(key), JSON.stringify(newValue))
    },
  })

  const reset = () => {
    value.value = parseFieldConfigMap(undefined, unref(fields), unref(defaultConfigMap))
    hasSaved.value = false
    localStorage.removeItem(unref(key))
  }

  if (isRef(key)) {
    watch(key, newKey => {
      value.value = parseFieldConfigMap(getFieldConfigMap(unref(newKey)), unref(fields), unref(defaultConfigMap))
    })
  }

  return {
    fieldConfigMap,
    hasSaved,
    reset,
  }
}
