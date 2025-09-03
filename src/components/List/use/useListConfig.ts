import {type MaybeRef, computed, isRef, markRaw, ref, unref, watch} from 'vue'

import IconGrid from '@/assets/icons/IconGrid.svg?component'
import IconList from '@/assets/icons/IconList.svg?component'

import {useIsMobile} from '@/utils/mobile'
import {ListMode} from '@/utils/utils'

import {type FieldConfig, type FieldConfigMap, type ListConfig, type ListField, type ListFields} from '../types'

export const listModeList = [
  ListMode.TABLE,
  ListMode.GRID,
]

const isListMode = (value: unknown): value is ListMode => {
  return typeof value === 'string' && listModeList.includes(value as ListMode)
}

const parseListMode = (value: unknown): ListMode | undefined => {
  return isListMode(value) ? value : undefined
}

export const listModeIconMap: Record<ListMode, SVGComponent> = {
  [ListMode.TABLE]: markRaw(IconList),
  [ListMode.GRID]: markRaw(IconGrid),
}

const fieldConfigKeyLength: ObjectKeys<FieldConfig>['length'] = 4

const isFieldConfig = (value: unknown): value is Partial<FieldConfig> => {
  return value instanceof Object
    && Object.keys(value).length <= fieldConfigKeyLength
    && (!('width' in value) || value.width === null || typeof value.width === 'number')
    && (!('visible' in value) || typeof value.visible === 'boolean')
    && (!('order' in value) || typeof value.order === 'number')
}

const parseFieldConfigMap = <Fields extends ListFields<unknown>>(value: unknown, fields: Fields, fieldConfigMap: FieldConfigMap<Fields>): FieldConfigMap<Fields> => {
  const configMap: Record<string, FieldConfig> = {}

  const processFields = (fieldList: ListFields<unknown, unknown> | ListFields<never, unknown>) => {
    fieldList.forEach(field => {
      if ('fields' in field.meta) {
        processFields(field.meta.fields)
        return
      }

      const config = value instanceof Object && field.meta.label in value ? value[field.meta.label as keyof typeof value] : undefined
      const defaultConfig = fieldConfigMap[field.meta.label as keyof typeof fieldConfigMap]

      if (!isFieldConfig(config)) {
        configMap[field.meta.label] = {...defaultConfig}
      } else {
        configMap[field.meta.label] = {
          width: config.width ?? null,
          visible: config.visible ?? defaultConfig.visible,
          order: config.order ?? defaultConfig.order,
          sticky: config.sticky ?? defaultConfig.sticky,
        }
      }
    })
  }

  processFields(fields)

  Object.values<FieldConfig>(configMap)
    .sort((a, b) => a.order - b.order)
    .forEach((item, index) => {
      item.order = index + 1
    })

  return configMap as FieldConfigMap<Fields>
}

const parseListConfig = <Fields extends ListFields<unknown>>(value: unknown, fields: Fields, fieldConfigMap: FieldConfigMap<Fields>, mode: ListMode = ListMode.TABLE): ListConfig<Fields> => {
  return {
    fields: parseFieldConfigMap(value instanceof Object && 'fields' in value ? value.fields : undefined, fields, fieldConfigMap),
    mode: value instanceof Object && 'mode' in value ? parseListMode(value.mode) ?? mode : mode,
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
    if ('fields' in field.meta) {
      const fields = filterFields(field.meta.fields, method)

      if (fields.length) result.push({...field, meta: {...field.meta, fields}})
    } else if (method(field.meta)) result.push(field)

    return result
  }, [] as unknown as F)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFirstFieldLabel = <F extends ListFields<any, any>[number]>(field: F): string => {
  return 'label' in field.meta ? field.meta.label : getFirstFieldLabel(field.meta.fields[0])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useListConfig = <Fields extends ListFields<any, any>>(key: MaybeRef<string>, fields: MaybeRef<Fields>, defaultConfigMap: MaybeRef<FieldConfigMap<Fields>>, defailtMode: MaybeRef<ListMode>, disable?: boolean) => {
  const {isMobile} = useIsMobile()

  const value = ref<ListConfig<Fields>>(
    parseListConfig(
      disable ? undefined : getListConfig(unref(key)),
      unref(fields),
      unref(defaultConfigMap),
      unref(defailtMode),
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

  const isGrid = computed(() => isMobile.value || value.value.mode === ListMode.GRID)

  const reset = () => {
    if (disable) return

    value.value = parseListConfig(undefined, unref(fields), unref(defaultConfigMap), unref(defailtMode))
    hasSaved.value = false
    localStorage.removeItem(unref(key))
  }

  const save = () => {
    if (disable) return

    localStorage.setItem(unref(key), JSON.stringify(value.value))
    hasSaved.value = true
  }

  const updateMode = (mode: ListMode) => {
    value.value.mode = mode

    save()
  }

  if (!disable && isRef(key)) watch(key, newKey => {
    value.value = parseListConfig(getListConfig(unref(newKey)), unref(fields), unref(defaultConfigMap), unref(defailtMode))
    hasSaved.value = localStorage.getItem(unref(key)) !== null
  })

  if (!disable && isRef(defaultConfigMap)) watch(defaultConfigMap, (newValue: FieldConfigMap<Fields>) => {
    value.value = parseListConfig(getListConfig(unref(key)), unref(fields), newValue, unref(defailtMode))
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortFields = <Fields extends ListFields<any, any>>(list: Fields, fieldConfigMap: Record<string, FieldConfig>) => {
  return list.slice().sort((a, b) => fieldConfigMap[getFirstFieldLabel(a)].order - fieldConfigMap[getFirstFieldLabel(b)].order)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const forEachField = <Fields extends ListFields<any, any>>(fields: Fields, callback: (field: Extract<Fields[number], {meta: {label: string}}>) => void) => {
  fields.forEach(field => {
    if ('fields' in field.meta) {
      forEachField(field.meta.fields as Fields, callback)
    } else {
      callback(field as Extract<Fields[number], {meta: {label: string}}>)
    }
  })
}

export const getFieldVariable = <T extends 'width' | 'left' | 'right', Label extends string>(type: T, label: Label): `--w-list-field-${ T }-${ Label }` => {
  return `--w-list-field-${ type }-${ label }`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldStylesWidth = <Fields extends ListFields<any, any>>(fields: Fields, fieldConfigMap: Record<string, FieldConfig>): Record<string, string> => {
  const styles: Record<string, string> = {}

  forEachField(fields, field => {
    if (fieldConfigMap[field.meta.label]?.width) {
      styles[getFieldVariable('width', field.meta.label)] = fieldConfigMap[field.meta.label].width + 'px'
    }
  })

  return styles
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldStylesFixed = <Fields extends ListFields<any, any>>(fields: Fields, fieldConfigMap: Record<string, FieldConfig>): Record<string, string> => {
  const styles: Record<string, string> = {}

  const fixedLabels: string[] = []

  forEachField(fields, field => {
    if (fieldConfigMap[field.meta.label]?.sticky) {
      fixedLabels.push(field.meta.label)
    }
  })

  fixedLabels.forEach((label, index, array) => {
    const left = array.slice(0, index).map(label => `var(${ getFieldVariable('width', label) })`).join(' + ')
    styles[getFieldVariable('left', label)] = `calc(var(--w-left-inner) + var(--w-list-left)${ left ? ` + ${ left }` : '' })`

    const right = array.slice(index + 1).map(label => `var(${ getFieldVariable('width', label) })`).join(' + ')
    styles[getFieldVariable('right', label)] = `calc(var(--w-right-inner) + var(--w-list-right)${ right ? ` + ${ right }` : '' })`
  })

  return styles
}
