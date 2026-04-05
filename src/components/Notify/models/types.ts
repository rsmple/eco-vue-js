import type {NotifyType} from './NotifyType'
import type {LinkProps} from '@/types/types'
import type {VNode} from 'vue'

export interface NotifyConfig extends Partial<LinkProps> {
  title: string | VNode
  caption?: string | VNode
  userInput?: string
  type: NotifyType
}

export type AddNotify = (config: NotifyConfig) => void
