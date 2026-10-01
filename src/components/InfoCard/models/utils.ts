import {SemanticType} from '@/utils/SemanticType'

export const infoCardSemanticTypeMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary surface-soft',
  [SemanticType.SECONDARY]: 'bg-surface-muted',
  [SemanticType.POSITIVE]: 'tone-positive surface-soft',
  [SemanticType.NEGATIVE]: 'tone-negative surface-soft',
  [SemanticType.WARNING]: 'tone-warning surface-soft',
  [SemanticType.INFO]: 'tone-info surface-soft',
}

export const infoCardIconSemanticTypeMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary text-tone',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.POSITIVE]: 'tone-positive text-tone',
  [SemanticType.NEGATIVE]: 'tone-negative text-tone',
  [SemanticType.WARNING]: 'tone-warning text-tone',
  [SemanticType.INFO]: 'tone-info text-tone',
}
