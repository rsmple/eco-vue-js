import type {SemanticType} from '@/utils/SemanticType'

export interface ConfirmModalProps {
  title: string
  description: string
  acceptText?: string
  acceptSemanticType?: SemanticType
  intermediateText?: string
  intermediateSemanticType?: SemanticType
  cancelText?: string
  onAccept: () => void | Promise<void>
  onIntermediate?: () => void | Promise<void>
  onCancel?: () => void
}
