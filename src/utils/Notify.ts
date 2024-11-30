import type {AddNotify, NotifyConfig} from '@/components/Notify/models/types'

import {NotifyType} from '@/components/Notify/models/NotifyType'

let addNotify: AddNotify | undefined

export const initNotify = (value: AddNotify | undefined) => {
  addNotify = value
}

export const Notify = {
  success(config: Omit<NotifyConfig, 'type'>): void {
    addNotify?.({...config, type: NotifyType.SUCCESS})
  },
  warn(config: Omit<NotifyConfig, 'type'>): void {
    addNotify?.({...config, type: NotifyType.WARN})
  },
  error(config: Omit<NotifyConfig, 'type'>): void {
    addNotify?.({...config, type: NotifyType.DANGER})
  },
}
