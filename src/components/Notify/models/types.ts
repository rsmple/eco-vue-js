import type {LinkProps} from '@/types/types'
import type {NotifyType} from './NotifyType'

export interface NotifyConfig extends Partial<LinkProps> {
  title: string
  caption?: string
  userInput?: string
  type: NotifyType
}

export type AddNotify = (config: NotifyConfig) => void
