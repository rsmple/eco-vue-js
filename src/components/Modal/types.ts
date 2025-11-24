import type {LinkProps} from '@/types/types'
import type {SemanticType} from '@/utils/SemanticType'
import type {Component, VNode} from 'vue'

export interface ConfirmModalProps {
  title: string | VNode | Component
  description: string | VNode | Component

  acceptText?: string | VNode | Component
  acceptSemanticType?: SemanticType

  intermediateText?: string | VNode | Component
  intermediateSemanticType?: SemanticType

  cancelText?: string | VNode | Component

  onAccept?: () => void | Promise<void>
  onIntermediate?: () => void | Promise<void>
  onCancel?: () => void

  acceptTo?: LinkProps['to']
  intermediateTo?: LinkProps['to']

  actionsCol?: boolean
  wrapperClass?: string
}
