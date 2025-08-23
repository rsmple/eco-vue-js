import {SemanticType} from '@/utils/SemanticType'

export const infoCardSemanticTypeMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'bg-primary/10 dark:bg-primary-dark/10',
  [SemanticType.SECONDARY]: 'bg-gray-100 dark:bg-gray-800',
  [SemanticType.POSITIVE]: 'bg-positive/10 dark:bg-positive-dark/10',
  [SemanticType.NEGATIVE]: 'bg-negative/10 dark:bg-negative-dark/10',
  [SemanticType.WARNING]: 'bg-warning/20 dark:bg-warning-dark/10',
  [SemanticType.INFO]: 'bg-info/10 dark:bg-info-dark/10',
}

export const infoCardIconSemanticTypeMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'text-primary dark:text-primary-dark',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.NEGATIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}
