import {SemanticType} from '@/utils/SemanticType'

export const progressBarClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'bg-primary dark:bg-primary-dark',
  [SemanticType.SECONDARY]: 'bg-gray-300 dark:bg-gray-600',
  [SemanticType.POSITIVE]: 'bg-positive dark:bg-positive-dark',
  [SemanticType.WARNING]: 'bg-warning dark:bg-warning-dark',
  [SemanticType.NEGATIVE]: 'bg-negative dark:bg-negative-dark',
  [SemanticType.INFO]: 'bg-info dark:bg-info-dark',
}

/** Label color over the fill. */
export const progressBarTextClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'text-default',
  [SemanticType.SECONDARY]: 'text-accent',
  [SemanticType.POSITIVE]: 'text-default',
  [SemanticType.WARNING]: 'text-black-default dark:text-default-dark',
  [SemanticType.NEGATIVE]: 'text-default',
  [SemanticType.INFO]: 'text-default',
}

/** The band that sweeps the track while progress is not known yet. */
export const progressBarIndeterminateClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'via-primary/40 dark:via-primary-dark/50',
  [SemanticType.SECONDARY]: 'via-gray-300 dark:via-gray-600',
  [SemanticType.POSITIVE]: 'via-positive/40 dark:via-positive-dark/50',
  [SemanticType.WARNING]: 'via-warning/50 dark:via-warning-dark/50',
  [SemanticType.NEGATIVE]: 'via-negative/40 dark:via-negative-dark/50',
  [SemanticType.INFO]: 'via-info/40 dark:via-info-dark/50',
}
