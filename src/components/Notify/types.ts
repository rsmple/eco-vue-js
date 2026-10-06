export type NotifyPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'

export interface NotifyProps {
  /** Corner or edge of the screen the toasts show in. On top they sit under the header (`--header-height`); new toasts stack away from the edge. On phones they always show at the top edge, over the header or a modal's title, clear of the buttons at the bottom and the fields under the header. */
  position?: NotifyPosition
}

export interface NotifyCenterProps {
  /** Heading of the notify center. Defaults to `Notifications`. */
  title?: string
  /** Text of the button that clears the history. Defaults to `Clear`. */
  clearText?: string
  /** Shown when there are no notifications. Defaults to `No notifications yet`. */
  emptyText?: string
  /** Heading of the notifications that need action (`NotifyChannel.ACTION`). Defaults to `Action required`. */
  actionText?: string
  /** Heading of the rest of the history, shown under the ones that need action. Defaults to `Activity`. */
  activityText?: string
}
