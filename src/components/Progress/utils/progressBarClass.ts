import {SemanticType} from '@/utils/SemanticType'

export const progressBarClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary bg-tone-fill',
  [SemanticType.SECONDARY]: 'bg-track-strong',
  [SemanticType.POSITIVE]: 'tone-positive bg-tone-fill',
  [SemanticType.WARNING]: 'tone-warning bg-tone-fill',
  [SemanticType.NEGATIVE]: 'tone-negative bg-tone-fill',
  [SemanticType.INFO]: 'tone-info bg-tone-fill',
}

/** Label color over the fill. */
export const progressBarTextClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary text-tone-on',
  [SemanticType.SECONDARY]: 'text-accent',
  [SemanticType.POSITIVE]: 'tone-positive text-tone-on',
  [SemanticType.WARNING]: 'tone-warning text-tone-on',
  [SemanticType.NEGATIVE]: 'tone-negative text-tone-on',
  [SemanticType.INFO]: 'tone-info text-tone-on',
}

/** The band that sweeps the track while progress is not known yet. */
export const progressBarIndeterminateClass: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary via-tone/40',
  [SemanticType.SECONDARY]: 'via-track-strong',
  [SemanticType.POSITIVE]: 'tone-positive via-tone/40',
  [SemanticType.WARNING]: 'tone-warning via-tone/40',
  [SemanticType.NEGATIVE]: 'tone-negative via-tone/40',
  [SemanticType.INFO]: 'tone-info via-tone/40',
}
