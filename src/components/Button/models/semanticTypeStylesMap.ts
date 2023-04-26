import {SemanticType} from '@/utils/SemanticType'

export const semanticTypeButtonStylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'bg-primary-default dark:bg-primary-dark text-secondary-default w-ripple-opacity-20 dark:w-ripple-opacity-30',
  [SemanticType.SECONDARY]: 'bg-secondary-default dark:bg-default-dark text-accent border border-solid border-gray-300 dark:border-gray-700 dark:w-ripple-opacity-30',
  [SemanticType.NEGARIVE]: 'bg-negative dark:bg-negative-dark text-secondary-default dark:text-default-dark w-ripple-opacity-20 dark:w-ripple-opacity-30',
  [SemanticType.POSITIVE]: 'bg-positive dark:bg-positive-dark text-secondary-default dark:text-default-dark w-ripple-opacity-20 dark:w-ripple-opacity-30',
  [SemanticType.WARNING]: 'bg-warning dark:bg-warning-dark text-black-default dark:text-default-dark dark:w-ripple-opacity-30',
  [SemanticType.INFO]: 'bg-info dark:bg-info-dark text-secondary-default dark:text-default-dark w-ripple-opacity-20 dark:w-ripple-opacity-30',
}

export const semanticTypeIconStylesMap: Record<SemanticType, string> = {
  ...semanticTypeButtonStylesMap,
  [SemanticType.SECONDARY]: 'bg-gray-400 dark:bg-gray-500 text-secondary-default',
}

export const semanticTypeTextStylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'text-primary-default dark:text-primary-dark',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.NEGARIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}
