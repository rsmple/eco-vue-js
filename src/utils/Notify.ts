import type {AddNotify, NotifyConfig, NotifyPatch} from '@/components/Notify/models/types'

import {NotifyType} from '@/components/Notify/models/NotifyType'
import {discardNotify, updateNotify} from '@/components/Notify/models/notifyCenter'

let addNotify: AddNotify | undefined

/** Sets what `Notify` calls add to. `WNotify` sets it while it is mounted. */
export const initNotify = (value: AddNotify | undefined) => {
  addNotify = value
}

const add = (config: NotifyConfig): number | undefined => {
  const id = addNotify?.(config)

  return typeof id === 'number' ? id : undefined
}

export const Notify = {
  success(config: Omit<NotifyConfig, 'type'>): number | undefined {
    return add({...config, type: NotifyType.SUCCESS})
  },
  warn(config: Omit<NotifyConfig, 'type'>): number | undefined {
    return add({...config, type: NotifyType.WARN})
  },
  error(config: Omit<NotifyConfig, 'type'>): number | undefined {
    return add({...config, type: NotifyType.DANGER})
  },
  /** Something in progress: shown with a spinner, and it can't be closed until `update` gives it another type. */
  process(config: Omit<NotifyConfig, 'type'>): number | undefined {
    return add({...config, type: NotifyType.PENDING})
  },
  /** Changes the notification with `id`, such as a `process` that finished. */
  update(id: number, patch: NotifyPatch): void {
    updateNotify(id, patch)
  },
  /** Removes the notification with `id` without calling its `onRemove`. */
  remove(id: number): void {
    discardNotify(id)
  },
}
