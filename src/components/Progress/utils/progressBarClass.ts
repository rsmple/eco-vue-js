import {SemanticType} from '@/utils/SemanticType'

export const progressBarClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'bg-primary dark:bg-primary-dark text-default dark:text-default-dark',
  [SemanticType.SECONDARY]: 'bg-gray-300 dark:bg-gray-700',
  [SemanticType.POSITIVE]: 'bg-positive dark:bg-positive-dark',
  [SemanticType.WARNING]: 'bg-warning dark:bg-warning-dark',
  [SemanticType.NEGATIVE]: 'bg-negative dark:bg-negative-dark',
  [SemanticType.INFO]: 'bg-info dark:bg-info-dark',
}

export const progressBarBorderClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'border-primary dark:border-primary-dark',
  [SemanticType.SECONDARY]: 'border-gray-300 dark:border-gray-700',
  [SemanticType.POSITIVE]: 'border-positive dark:border-positive-dark',
  [SemanticType.WARNING]: 'border-warning dark:border-warning-dark',
  [SemanticType.NEGATIVE]: 'border-negative dark:border-negative-dark',
  [SemanticType.INFO]: 'border-info dark:border-info-dark',
}
