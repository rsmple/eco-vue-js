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
  [SemanticType.SECONDARY]: 'bg-default dark:bg-default-dark text-accent',
  [SemanticType.NEGATIVE]: 'bg-negative dark:bg-negative-dark text-default',
  [SemanticType.POSITIVE]: 'bg-positive dark:bg-positive-dark text-default',
  [SemanticType.WARNING]: 'bg-warning dark:bg-warning-dark text-black-default dark:text-default-dark ',
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
  [SemanticType.SECONDARY]: 'bg-gray-200 dark:bg-gray-800 text-description',
})

export const useSemanticTypeChipMap = () => {
  return semanticTypeChipMap
}

export const setSemanticTypeChipMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeChipMap, value)
}

const semanticTypeBorderMap = reactive<Record<SemanticType, string>>({
  [SemanticType.PRIMARY]: 'border-solid border-primary dark:border-primary-dark',
  [SemanticType.SECONDARY]: 'border-solid border-gray-300 dark:border-gray-700',
  [SemanticType.NEGATIVE]: 'border-solid border-negative dark:border-negative-dark',
  [SemanticType.POSITIVE]: 'border-solid border-positive dark:border-positive-dark',
  [SemanticType.WARNING]: 'border-solid border-warning dark:border-warning-dark',
  [SemanticType.INFO]: 'border-solid border-info dark:border-info-dark',
})

export const useSemanticTypeBorderMap = () => {
  return semanticTypeBorderMap
}

export const setSemanticTypeBorderMap = (value: Partial<Record<SemanticType, string>>) => {
  Object.assign(semanticTypeBorderMap, value)
}

const semanticTypeTextStylesMap = reactive<Record<SemanticType, string>>({
  [SemanticType.PRIMARY]: 'text-primary dark:text-primary-dark',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.NEGATIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
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