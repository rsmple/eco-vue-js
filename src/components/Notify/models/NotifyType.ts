export enum NotifyType {
  SUCCESS = 'success',
  WARN = 'warn',
  DANGER = 'danger',
  /** Something in progress, shown with a spinner until it is updated to another type. */
  PENDING = 'pending',
}

/** Where a notification sits in the notify center. */
export enum NotifyChannel {
  /** History: what happened. Toasts close by themselves, and clearing the history removes them. */
  ACTIVITY = 'activity',
  /** Needs the user: pinned on top, its toast stays until closed, and clearing the history keeps it. */
  ACTION = 'action',
}
