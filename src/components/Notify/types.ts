import type {NotifyItem} from './models/types'

export type NotifyPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

export interface NotifyProps {
  /** Corner or edge of the screen the toasts show in. On top they sit under the header (`--header-height`); new toasts stack away from the edge. On phones they always show at the top edge, over the header or a modal's title, clear of the buttons at the bottom and the fields under the header. */
  position?: NotifyPosition
}

export interface NotifyCenterProps {
  /** Shows a button beside the heading of the notifications that need action that hands them all to this function — such as to dismiss them on the server in one request — and removes them once it resolves, without calling their `onRemove`. A rejection keeps them. */
  onDismissActions?: (items: NotifyItem[]) => unknown
  /** Heading of the notify center. Defaults to `Notifications`. */
  title?: string
  /** Text of the button beside the activity heading that clears it. Defaults to `Clear`. */
  clearText?: string
  /** Text of the button that dismisses the notifications that need action, shown with `onDismissActions`. Defaults to `Dismiss all`. */
  dismissActionsText?: string
  /** Shown when there are no notifications. Defaults to `No notifications yet`. */
  emptyText?: string
  /** Heading of the notifications that need action (`NotifyChannel.ACTION`). Defaults to `Action required`. */
  actionText?: string
  /** Heading of the rest of the history, shown under the ones that need action. Defaults to `Activity`. */
  activityText?: string
}
