import type {RouteLocationNamedRaw} from 'vue-router'
import type {NotifyType} from './NotifyType'

export type NotifyConfig = {
  title: string
  caption?: string
  userInput?: string
  type: NotifyType
  to?: RouteLocationNamedRaw
}

export type AddNotify = (config: NotifyConfig) => void
