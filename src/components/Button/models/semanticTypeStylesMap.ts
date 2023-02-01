import {SemanticType} from '@/utils/SemanticType'

export const semanticTypeStylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'bg-primary-default dark:bg-primary-dark text-black-default dark:text-default-dark',
  [SemanticType.SECONDARY]: 'bg-secondary-default dark:bg-default-dark text-black-default dark:text-gray-100 border border-solid border-gray-300 dark:border-gray-700',
  [SemanticType.NEGARIVE]: 'bg-negative dark:bg-negative-dark text-secondary-default dark:text-default-dark',
  [SemanticType.POSITIVE]: 'bg-positive dark:bg-positive-dark text-secondary-default dark:text-default-dark',
  [SemanticType.WARNING]: 'bg-warning dark:bg-warning-dark text-black-default dark:text-default-dark',
  [SemanticType.INFO]: 'bg-info dark:bg-info-dark text-secondary-default dark:text-default-dark',
}
