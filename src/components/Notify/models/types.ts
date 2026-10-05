import type {NotifyChannel, NotifyType} from './NotifyType'
import type {LinkProps} from '@/types/types'
import type {Component, VNode} from 'vue'

/** Notifications sharing a group `key` show as one entry while there are two or more of them, with the group's title and caption. */
export type NotifyGroup = {
  key: string
  title: string
  caption?: string
  /** Rendered in the entry with `componentProps` and the group's `items`. */
  component?: Component
  componentProps?: Record<string, unknown>
  /** Called instead of each item's `onRemove` when the user closes the group. */
  onRemoveItems?: (items: NotifyItem[]) => void
}

export interface NotifyConfig extends Partial<LinkProps> {
  title: string | VNode
  caption?: string | VNode
  userInput?: string
  type: NotifyType
  /** Shown once: adding the same key again returns the existing notification, and nothing is added after it was removed. */
  key?: string
  /** `false` adds it to the notify center without a toast. */
  toast?: boolean
  /** Defaults to `NotifyChannel.ACTIVITY`. */
  channel?: NotifyChannel
  group?: NotifyGroup
  /** Rendered under the caption with `componentProps`. It may emit `update` with `NotifyPatch` and `remove` — see `NotifyContentEmits`. */
  component?: Component
  componentProps?: Record<string, unknown>
  /** Called when the user closes it. */
  onRemove?: () => void
}

export type AddNotify = (config: NotifyConfig) => number | void

export type NotifyItem = NotifyConfig & {
  id: number
  /** How many times the same notification was added within a toast's lifetime. */
  count: number
  date: Date
  channel: NotifyChannel
  /** Members of a group entry. */
  items?: NotifyItem[]
}

export type NotifyPatch = Partial<Pick<NotifyItem, 'title' | 'caption' | 'type' | 'channel' | 'group'>>

/** Emits of a notification's `component`. */
export type NotifyContentEmits = {
  (e: 'update', value: NotifyPatch): void
  (e: 'remove'): void
}
