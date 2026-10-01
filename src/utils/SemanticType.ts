import {type VNode, reactive} from 'vue'

export enum SemanticType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  NEGATIVE = 'negative',
  POSITIVE = 'positive',
  WARNING = 'warning',
  INFO = 'info',
}

const semanticTypeConfig = reactive<Record<SemanticType, string>>({
  [SemanticType.PRIMARY]: 'tone-primary surface-fill',
  [SemanticType.SECONDARY]: 'bg-surface text-accent',
  [SemanticType.NEGATIVE]: 'tone-negative surface-fill',
  [SemanticType.POSITIVE]: 'tone-positive surface-fill',
  [SemanticType.WARNING]: 'tone-warning surface-fill',
  [SemanticType.INFO]: 'tone-info surface-fill',
})

export const useSemanticTypeBackgroundMap = () => {
  return semanticTypeConfig
}

export const setSemanticTypeBackgroundMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeConfig, value)
}

const semanticTypeChipMap = reactive<Record<SemanticType, string>>({
  ...semanticTypeConfig,
  [SemanticType.SECONDARY]: 'bg-surface-inset text-accent',
})

export const useSemanticTypeChipMap = () => {
  return semanticTypeChipMap
}

export const setSemanticTypeChipMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeChipMap, value)
}

const semanticTypeBorderMap = reactive<Record<SemanticType, string>>({
  [SemanticType.PRIMARY]: 'tone-primary border-solid border-tone-fill',
  [SemanticType.SECONDARY]: 'border-solid border-line',
  [SemanticType.NEGATIVE]: 'tone-negative border-solid border-tone-fill',
  [SemanticType.POSITIVE]: 'tone-positive border-solid border-tone-fill',
  [SemanticType.WARNING]: 'tone-warning border-solid border-tone-fill',
  [SemanticType.INFO]: 'tone-info border-solid border-tone-fill',
})

export const useSemanticTypeBorderMap = () => {
  return semanticTypeBorderMap
}

export const setSemanticTypeBorderMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeBorderMap, value)
}

const semanticTypeTextStylesMap = reactive<Record<SemanticType, string>>({
  [SemanticType.PRIMARY]: 'tone-primary text-tone',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.NEGATIVE]: 'tone-negative text-tone',
  [SemanticType.POSITIVE]: 'tone-positive text-tone',
  [SemanticType.WARNING]: 'tone-warning text-tone',
  [SemanticType.INFO]: 'tone-info text-tone',
})

export const useSemanticTypeTextMap = () => {
  return semanticTypeTextStylesMap
}

export const setSemanticTypeTextMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeTextStylesMap, value)
}

const semanticTypeBorderComponentMap = reactive<Partial<Record<SemanticType, VNode>>>({
  [SemanticType.PRIMARY]: undefined,
  [SemanticType.SECONDARY]: undefined,
  [SemanticType.NEGATIVE]: undefined,
  [SemanticType.POSITIVE]: undefined,
  [SemanticType.WARNING]: undefined,
  [SemanticType.INFO]: undefined,
})

export const useSemanticTypeBorderComponentMap = () => {
  return semanticTypeBorderComponentMap
}

export const setSemanticTypeBorderComponentMap = (value: Partial<Record<SemanticType, VNode>>) => {
  Object.assign(semanticTypeBorderComponentMap, value)
}

const semanticTypeButtonBackgroundMap = reactive<Partial<Record<SemanticType, string | undefined>>>({
  [SemanticType.PRIMARY]: undefined,
  [SemanticType.SECONDARY]: undefined,
  [SemanticType.NEGATIVE]: undefined,
  [SemanticType.POSITIVE]: undefined,
  [SemanticType.WARNING]: undefined,
  [SemanticType.INFO]: undefined,
})

export const useSemanticTypeButtonBackgroundMap = () => {
  return semanticTypeButtonBackgroundMap
}

export const setSemanticTypeButtonBackgroundMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeButtonBackgroundMap, value)
}

export const patchSemanticType = (key: string, value: string) => {
  (SemanticType as Record<string, string>)[key] = value
  ;(SemanticType as Record<string, string>)[value] = key
}