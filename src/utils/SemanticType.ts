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
  [SemanticType.PRIMARY]: 'bg-primary dark:bg-primary-dark text-default',
  [SemanticType.SECONDARY]: 'bg-surface text-accent',
  [SemanticType.NEGATIVE]: 'bg-negative dark:bg-negative-dark text-default',
  [SemanticType.POSITIVE]: 'bg-positive dark:bg-positive-dark text-default',
  [SemanticType.WARNING]: 'bg-warning dark:bg-warning-dark text-black-default dark:text-default-dark',
  [SemanticType.INFO]: 'bg-info dark:bg-info-dark text-default',
})

export const useSemanticTypeBackgroundMap = () => {
  return semanticTypeConfig
}

export const setSemanticTypeBackgroundMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeConfig, value)
}

const semanticTypeChipMap = reactive<Record<SemanticType, string>>({
  ...semanticTypeConfig,
  [SemanticType.SECONDARY]: 'bg-gray-200 dark:bg-gray-800 text-accent',
})

export const useSemanticTypeChipMap = () => {
  return semanticTypeChipMap
}

export const setSemanticTypeChipMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeChipMap, value)
}

const semanticTypeBorderMap = reactive<Record<SemanticType, string>>({
  [SemanticType.PRIMARY]: 'tone-primary border-solid border-tone',
  [SemanticType.SECONDARY]: 'border-solid border-line',
  [SemanticType.NEGATIVE]: 'tone-negative border-solid border-tone',
  [SemanticType.POSITIVE]: 'tone-positive border-solid border-tone',
  [SemanticType.WARNING]: 'tone-warning border-solid border-tone',
  [SemanticType.INFO]: 'tone-info border-solid border-tone',
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