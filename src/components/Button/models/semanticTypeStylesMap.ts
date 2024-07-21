import {SemanticType} from '@/utils/SemanticType'

export const semanticTypeButtonStylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'bg-primary-default dark:bg-primary-dark text-secondary-default',
  [SemanticType.SECONDARY]: 'bg-secondary-default dark:bg-default-dark text-accent',
  [SemanticType.NEGARIVE]: 'bg-negative dark:bg-negative-dark text-secondary-default dark:text-default-dark',
  [SemanticType.POSITIVE]: 'bg-positive dark:bg-positive-dark text-secondary-default dark:text-default-dark',
  [SemanticType.WARNING]: 'bg-warning dark:bg-warning-dark text-black-default dark:text-default-dark ',
  [SemanticType.INFO]: 'bg-info dark:bg-info-dark text-secondary-default dark:text-default-dark',
}

export const semanticTypeButtonBorderStylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'border border-solid border-primary-default dark:border-primary-dark',
  [SemanticType.SECONDARY]: 'border border-solid border-gray-300 dark:border-gray-700',
  [SemanticType.NEGARIVE]: 'border border-solid border-negative dark:border-negative-dark',
  [SemanticType.POSITIVE]: 'border border-solid border-positive dark:border-positive-dark',
  [SemanticType.WARNING]: 'border border-solid border-warning dark:border-warning-dark',
  [SemanticType.INFO]: 'border border-solid border-info dark:border-info-dark',
}

export const semanticTypeTextStylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'text-primary-default dark:text-primary-dark',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.NEGARIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}
