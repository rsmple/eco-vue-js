import {SemanticType} from '@/utils/SemanticType'

export const infoCardSemanticTypeMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'bg-primary/10 dark:bg-primary-dark/10',
  [SemanticType.SECONDARY]: 'bg-surface-muted',
  [SemanticType.POSITIVE]: 'bg-positive/10 dark:bg-positive-dark/10',
  [SemanticType.NEGATIVE]: 'bg-negative/10 dark:bg-negative-dark/10',
  [SemanticType.WARNING]: 'bg-warning/20 dark:bg-warning-dark/10',
  [SemanticType.INFO]: 'bg-info/10 dark:bg-info-dark/10',
}

export const infoCardIconSemanticTypeMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary text-tone',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.POSITIVE]: 'tone-positive text-tone',
  [SemanticType.NEGATIVE]: 'tone-negative text-tone',
  [SemanticType.WARNING]: 'tone-warning text-tone',
  [SemanticType.INFO]: 'tone-info text-tone',
}
