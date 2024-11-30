import type {NotifyType} from './NotifyType'
import type {LinkProps} from '@/types/types'

export interface NotifyConfig extends Partial<LinkProps> {
  title: string
  caption?: string
  userInput?: string
  type: NotifyType
}

export type AddNotify = (config: NotifyConfig) => void
