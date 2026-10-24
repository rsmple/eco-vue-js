import {computed, markRaw, onMounted, ref, watch} from 'vue'

import IconGrid from '@/assets/icons/IconGrid.svg?component'
import IconList from '@/assets/icons/IconList.svg?component'

import {useIsMobile} from '@/utils/mobile'
import {ListMode, getIsClientSide} from '@/utils/utils'

import {type FieldConfig, type FieldConfigMap, type ListColumnWidth, type ListConfig, type ListField, type ListFields} from '../types'

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

export const listModeLabelMap: Record<ListMode, string> = {
  [ListMode.TABLE]: 'Table mode',
  [ListMode.GRID]: 'Grid mode',
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

      // A field missing from the default map (added after the map was built) is hidden and goes last.
      const defaultConfig: FieldConfig = fieldConfigMap[field.meta.label as keyof typeof fieldConfigMap] ?? {
        width: null,
        visible: false,
        order: Number.MAX_SAFE_INTEGER,
        sticky: field.meta.sticky ?? false,
      }
      const configValue = value instanceof Object && field.meta.label in value ? value[field.meta.label as keyof typeof value] as unknown as Partial<FieldConfig> : undefined
      const config: FieldConfig | undefined = configValue instanceof Object ? {
        width: configValue.width ?? null,
        visible: configValue.visible ?? defaultConfig.visible,
        order: configValue.order ?? defaultConfig.order,
        sticky: configValue.sticky ?? defaultConfig.sticky,
      } : undefined

      if (!isFieldConfig(config)) {
        configMap[field.meta.label] = {...defaultConfig}
      } else {
        configMap[field.meta.label] = config
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

const getHasSavedConfig = (key: string): boolean => getIsClientSide() && localStorage.getItem(key) !== null

const getListConfig = (key: string): unknown | undefined => {
  if (!getIsClientSide()) return undefined

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
  return 'label' in field.meta ? field.meta.label : getFirstFieldLabel(field.meta.fields[0]!)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useListConfig = <Fields extends ListFields<any, any>>(
  key: () => string,
  fields: () => Fields,
  defaultConfigMap: () => FieldConfigMap<Fields>,
  defailtMode: () => ListMode,
  disable?: boolean,
) => {
  const {isMobile} = useIsMobile()

  // The saved config is read on mount, not in setup: the server has no storage, so the first render uses the
  // defaults on both sides and hydrates cleanly. The update lands before the first paint.
  const value = ref<ListConfig<Fields>>(parseListConfig(undefined, fields(), defaultConfigMap(), defailtMode()))
  const hasSaved = ref(false)

  if (!disable) {
    onMounted(() => {
      const saved = parseListConfig(getListConfig(key()), fields(), defaultConfigMap(), defailtMode())

      // Kept when nothing differs from the defaults, so every row is not re-rendered for new but equal configs.
      if (JSON.stringify(saved) !== JSON.stringify(value.value)) value.value = saved
      hasSaved.value = getHasSavedConfig(key())
    })
  }

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

    value.value = parseListConfig(undefined, fields(), defaultConfigMap(), defailtMode())
    hasSaved.value = false
    localStorage.removeItem(key())
  }

  const save = () => {
    if (disable) return

    localStorage.setItem(key(), JSON.stringify(value.value))
    hasSaved.value = true
  }

  const updateMode = (mode: ListMode) => {
    value.value.mode = mode

    save()
  }

  if (!disable) {
    watch(key, newKey => {
      value.value = parseListConfig(getListConfig(newKey), fields(), defaultConfigMap(), defailtMode())
      hasSaved.value = getHasSavedConfig(newKey)
    })
    watch(defaultConfigMap, (newValue: FieldConfigMap<Fields>) => {
      value.value = parseListConfig(getListConfig(key()), fields(), newValue, defailtMode())
      hasSaved.value = getHasSavedConfig(key())
    })
  }

  // Fields can change at runtime: keep the current config and fill in the fields it does not cover yet.
  watch(fields, newFields => {
    value.value = parseListConfig(value.value, newFields, defaultConfigMap(), defailtMode())
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
  return list.slice().sort((a, b) => fieldConfigMap[getFirstFieldLabel(a)]!.order - fieldConfigMap[getFirstFieldLabel(b)]!.order)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sortFieldsDeep = <Fields extends ListFields<any, any>>(list: Fields, fieldConfigMap: Record<string, FieldConfig>): Fields => {
  return sortFields(list, fieldConfigMap).map(field => 'fields' in field.meta
    ? {...field, meta: {...field.meta, fields: sortFieldsDeep(field.meta.fields, fieldConfigMap)}}
    : field,
  ) as Fields
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

const DEFAULT_COLUMN_WIDTH: ListColumnWidth = '10rem'

const getFieldTrack = (field: ListField<unknown>, config: FieldConfig | undefined): string => {
  return config?.width ? `${ config.width }px` : field.width ?? DEFAULT_COLUMN_WIDTH
}

// The width of a flexible column while the list scrolls sideways, the only time a sticky column moves from its place.
const getFieldTrackMin = (track: string): string => {
  return track.startsWith('minmax(') ? track.slice('minmax('.length, track.indexOf(',')) : track
}

/**
 * Track sizes of the table columns, in the order the fields are rendered. Without a flexible column, an empty last
 * track takes the space the columns leave, so the header and the rows still stretch to the full width of the list.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldTracks = <Fields extends ListFields<any, any>>(fields: Fields, fieldConfigMap: Record<string, FieldConfig>): string => {
  const tracks: string[] = []

  forEachField(fields, field => {
    tracks.push(getFieldTrack(field.meta, fieldConfigMap[field.meta.label]))
  })

  if (!tracks.some(track => track.startsWith('minmax('))) tracks.push('minmax(0,1fr)')

  return tracks.join(' ')
}

/** Offsets of the sticky columns, from the widths of the sticky columns before and after each. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldStylesSticky = <Fields extends ListFields<any, any>>(fields: Fields, fieldConfigMap: Record<string, FieldConfig>): Record<string, {left: string, right: string}> => {
  const sticky: {label: string, width: string}[] = []

  forEachField(fields, field => {
    const config = fieldConfigMap[field.meta.label]

    if (config?.sticky) sticky.push({label: field.meta.label, width: getFieldTrackMin(getFieldTrack(field.meta, config))})
  })

  const styles: Record<string, {left: string, right: string}> = {}

  sticky.forEach(({label}, index) => {
    const left = sticky.slice(0, index).map(item => item.width).join(' + ')
    const right = sticky.slice(index + 1).map(item => item.width).join(' + ')

    styles[label] = {
      left: `calc(var(--w-left-inner) + var(--w-list-left)${ left ? ` + ${ left }` : '' })`,
      right: `calc(var(--w-right-inner) + var(--w-list-right)${ right ? ` + ${ right }` : '' })`,
    }
  })

  return styles
}

/** Number of table columns the fields take, counting the columns of nested fields. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldColumnCount = <Fields extends ListFields<any, any>>(fields: Fields): number => {
  let count = 0

  forEachField(fields, () => count++)

  return count
}
