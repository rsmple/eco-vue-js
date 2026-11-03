import {SemanticType} from '@/utils/SemanticType'

export const sectionToneMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary',
  [SemanticType.SECONDARY]: '',
  [SemanticType.POSITIVE]: 'tone-positive',
  [SemanticType.NEGATIVE]: 'tone-negative',
  [SemanticType.WARNING]: 'tone-warning',
  [SemanticType.INFO]: 'tone-info',
}
