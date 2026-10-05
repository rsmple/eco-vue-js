import type {NotifyConfig, NotifyGroup, NotifyItem, NotifyPatch} from './types'

import {type ComputedRef, type Ref, computed, markRaw, ref, watch} from 'vue'

import IconDanger from '@/assets/icons/IconDanger.svg?component'
import IconSpinner from '@/assets/icons/IconSpinner.svg?component'
import IconSuccess from '@/assets/icons/IconSuccess.svg?component'
import IconWarn from '@/assets/icons/IconWarn.svg?component'

import {SemanticType} from '@/utils/SemanticType'

import {NotifyChannel, NotifyType} from './NotifyType'

export const notifyTypeSemanticTypeMap: Record<NotifyType, SemanticType> = {
  [NotifyType.PENDING]: SemanticType.PRIMARY,
  [NotifyType.SUCCESS]: SemanticType.POSITIVE,
  [NotifyType.WARN]: SemanticType.WARNING,
  [NotifyType.DANGER]: SemanticType.NEGATIVE,
}

export const notifyTypeIconMap: Record<NotifyType, SVGComponent> = {
  [NotifyType.SUCCESS]: markRaw(IconSuccess),
  [NotifyType.WARN]: markRaw(IconWarn),
  [NotifyType.DANGER]: markRaw(IconDanger),
  [NotifyType.PENDING]: markRaw(IconSpinner),
}

// A group takes the type of its most severe member.
const notifyTypeSeverityList: NotifyType[] = [NotifyType.PENDING, NotifyType.DANGER, NotifyType.WARN, NotifyType.SUCCESS]

const TOAST_DELAY = 5000
const HISTORY_LIMIT = 50

const items = ref([]) as Ref<NotifyItem[]>
const toastIds = ref<number[]>([])
type ToastTimer = {remaining: number, startedAt: number, timeout?: ReturnType<typeof setTimeout>}

const toastTimers = new Map<number, ToastTimer>()
let isToastsPaused = false
const dismissedKeys = new Set<string>()

/** The notify center is open: toasts are hidden while it is. */
export const isNotifyCenterOpen = ref(false)

export const notifyCenterItems: ComputedRef<NotifyItem[]> = computed(() => items.value)

const isActionRequired = (item: NotifyItem) => item.channel === NotifyChannel.ACTION

export const isNotifyPending = (item: NotifyItem) => item.type === NotifyType.PENDING

export const notifyCenterActionItems: ComputedRef<NotifyItem[]> = computed(() => items.value.filter(isActionRequired))

export const notifyCenterActivityItems: ComputedRef<NotifyItem[]> = computed(() => items.value.filter(item => !isActionRequired(item)))

export const getNotifyItemKey = (item: NotifyItem): string => item.items ? `group:${ item.key }` : `item:${ item.id }`

const toGroupItem = (group: NotifyGroup, members: [NotifyItem, ...NotifyItem[]]): NotifyItem => {
  // Newest first, the same in a toast and in the center.
  const items = [...members].sort((a, b) => b.date.getTime() - a.date.getTime() || b.id - a.id) as [NotifyItem, ...NotifyItem[]]

  return {
    ...group,
    componentProps: {...group.componentProps, items},
    id: items[0].id,
    type: notifyTypeSeverityList.find(type => items.some(item => item.type === type)) ?? NotifyType.SUCCESS,
    count: items.length,
    date: new Date(Math.max(...items.map(item => item.date.getTime()))),
    channel: items[0].channel,
    items,
  }
}

const groupItems = (list: NotifyItem[]): NotifyItem[] => {
  const groupMembers = new Map<string, [NotifyItem, ...NotifyItem[]]>()

  list.forEach(item => {
    if (!item.group) return

    const members = groupMembers.get(item.group.key)

    if (members) members.push(item)
    else groupMembers.set(item.group.key, [item])
  })

  return list.flatMap(item => {
    const members = item.group ? groupMembers.get(item.group.key) : undefined

    if (!item.group || !members || members.length < 2) return [item]
    if (members[0] !== item) return []

    return [toGroupItem(item.group, members)]
  })
}

export const notifyCenterActionEntries: ComputedRef<NotifyItem[]> = computed(() => groupItems(notifyCenterActionItems.value))

export const notifyCenterActivityEntries: ComputedRef<NotifyItem[]> = computed(() => groupItems(notifyCenterActivityItems.value))

export const notifyCenterActionCount = computed(() => notifyCenterActionItems.value.length)

export const notifyCenterPendingCount = computed(() => items.value.filter(isNotifyPending).length)

const notifyCenterToasts: ComputedRef<NotifyItem[]> = computed(() => toastIds.value
  .map(id => items.value.find(item => item.id === id))
  .filter(item => item !== undefined),
)

export const notifyCenterToastEntries: ComputedRef<NotifyItem[]> = computed(() => groupItems(notifyCenterToasts.value))

let i = 0
const getId = () => ++i

const findItem = (id: number) => items.value.find(item => item.id === id)

const clearToastTimer = (id: number): void => {
  clearTimeout(toastTimers.get(id)?.timeout)
  toastTimers.delete(id)
}

export const hideToast = (id: number): void => {
  clearToastTimer(id)

  toastIds.value = toastIds.value.filter(item => item !== id)
}

const hideAllToasts = (): void => {
  toastIds.value.forEach(clearToastTimer)

  toastIds.value = []
}

watch(isNotifyCenterOpen, isOpen => {
  if (isOpen) hideAllToasts()
})

// Members of a group on screen share one toast: they are kept up and hidden together.
const getToastGroupIds = (id: number): number[] => {
  const groupKey = findItem(id)?.group?.key

  if (groupKey === undefined) return [id]

  return toastIds.value.filter(value => findItem(value)?.group?.key === groupKey)
}

// Hidden in one update, so a group's toast leaves as it is instead of shrinking member by member first.
const hideToastGroup = (id: number): void => {
  const ids = getToastGroupIds(id).filter(value => {
    const item = findItem(value)

    return value === id || !item || !isActionRequired(item)
  })

  ids.forEach(clearToastTimer)

  toastIds.value = toastIds.value.filter(value => !ids.includes(value))
}

const startToastTimer = (timer: ToastTimer, id: number): void => {
  timer.startedAt = Date.now()
  timer.timeout = setTimeout(() => hideToastGroup(id), timer.remaining)
}

const scheduleToastHide = (id: number): void => {
  clearToastTimer(id)

  const item = findItem(id)

  if (item && isActionRequired(item)) return

  const timer: ToastTimer = {remaining: TOAST_DELAY, startedAt: 0}

  toastTimers.set(id, timer)

  if (!isToastsPaused) startToastTimer(timer, id)
}

/** Holds the toasts on screen while the user is over them: their timers stop and go on with the time they had left. */
export const setToastsPaused = (value: boolean): void => {
  if (value === isToastsPaused) return

  isToastsPaused = value

  toastTimers.forEach((timer, id) => {
    if (!value) return startToastTimer(timer, id)

    clearTimeout(timer.timeout)
    timer.remaining -= Date.now() - timer.startedAt
  })
}

// With no toasts left there is nothing under the pointer, though it may never get to leave them.
watch(() => toastIds.value.length, length => {
  if (!length) setToastsPaused(false)
})

const showToast = (id: number): void => {
  // Added by the click that closes the center, such as on a button beside it, it shows once that click is done.
  if (isNotifyCenterOpen.value) {
    setTimeout(() => {
      if (!isNotifyCenterOpen.value && findItem(id)) showToast(id)
    })

    return
  }

  if (!toastIds.value.includes(id)) toastIds.value = [...toastIds.value, id]

  // A group's toast stays up for the full delay after its latest member.
  getToastGroupIds(id).forEach(scheduleToastHide)
}

const trimHistory = (): void => {
  const overflow = items.value.length - HISTORY_LIMIT

  if (overflow <= 0) return

  const removable = items.value.filter(item => !isNotifyPending(item) && !isActionRequired(item) && !toastIds.value.includes(item.id)).slice(-overflow)

  items.value = items.value.filter(item => !removable.includes(item))
}

const markGroupRaw = (group: NotifyGroup | undefined): NotifyGroup | undefined => {
  return group?.component ? {...group, component: markRaw(group.component)} : group
}

// The same notification added again while its toast would still be up is counted instead of added.
// A group member is always added, so the group grows the same way in a toast and in the center.
const findMergeable = (config: NotifyConfig) => {
  if (config.component || config.group) return undefined

  const channel = config.channel ?? NotifyChannel.ACTIVITY

  return items.value.find(item => !item.component
    && item.channel === channel
    && Date.now() - item.date.getTime() < TOAST_DELAY
    && item.type === config.type
    && (typeof config.title !== 'string' || item.title === config.title)
    && (typeof config.caption !== 'string' || item.caption === config.caption)
    && item.userInput === config.userInput
    && (item.to as {name: string})?.name === (config.to as {name: string})?.name,
  )
}

/** Adds a notification and returns its id — or `undefined` when its `key` was removed before. */
export const addNotify = (config: NotifyConfig): number | undefined => {
  if (config.key !== undefined) {
    if (dismissedKeys.has(config.key)) return undefined

    const existing = items.value.find(item => item.key === config.key)

    if (existing) return existing.id
  }

  const mergeable = findMergeable(config)

  const item: NotifyItem = {
    ...config,
    component: config.component ? markRaw(config.component) : undefined,
    group: markGroupRaw(config.group),
    id: mergeable?.id ?? getId(),
    count: (mergeable?.count ?? 0) + 1,
    date: new Date(),
    channel: config.channel ?? NotifyChannel.ACTIVITY,
  }

  items.value = [item, ...items.value.filter(value => value !== mergeable)]

  trimHistory()
  if (config.toast !== false) showToast(item.id)

  return item.id
}

/** Changes a notification. A pending one that gets another type shows its toast again. */
export const updateNotify = (id: number, patch: NotifyPatch): void => {
  const item = findItem(id)

  if (!item) return

  const finished = isNotifyPending(item) && patch.type !== undefined && patch.type !== NotifyType.PENDING
  const channelChanged = patch.channel !== undefined && patch.channel !== item.channel

  Object.assign(item, {...patch, date: new Date()}, 'group' in patch ? {group: markGroupRaw(patch.group)} : {})

  if (finished) showToast(id)
  else if (channelChanged && toastIds.value.includes(id)) scheduleToastHide(id)
}

const discardItem = (item: NotifyItem): void => {
  if (item.key !== undefined) dismissedKeys.add(item.key)

  hideToast(item.id)

  items.value = items.value.filter(value => value.id !== item.id)
}

/** Removes a notification without calling its `onRemove`. */
export const discardNotify = (id: number): void => {
  const item = findItem(id)

  if (item) discardItem(item)
}

/** Removes a notification as the user closing it: calls its `onRemove`. A pending one stays. */
export const removeNotify = (id: number): void => {
  const item = findItem(id)

  if (!item || isNotifyPending(item)) return

  item.onRemove?.()

  discardItem(item)
}

export const removeNotifyEntry = (entry: NotifyItem): void => {
  if (!entry.items) return removeNotify(entry.id)

  const removable = entry.items.filter(item => !isNotifyPending(item))
  const onRemoveItems = entry.items[0]?.group?.onRemoveItems

  if (!onRemoveItems) return removable.forEach(item => removeNotify(item.id))

  if (removable.length) onRemoveItems(removable)

  removable.forEach(discardItem)
}

/** Clears the history, keeping pending notifications, those that need action and those on screen. */
export const clearNotifyHistory = (): void => {
  items.value = items.value.filter(item => isNotifyPending(item) || isActionRequired(item) || toastIds.value.includes(item.id))
}

let closeCenter: (() => void) | null = null

/** Remembers how to close the open notify center, for `closeNotifyCenter`. */
export const setNotifyCenterClose = (value: (() => void) | null): void => {
  closeCenter = value
}

/** Closes the notify center, if it is open — such as from a link in its footer. */
export const closeNotifyCenter = (): void => {
  closeCenter?.()
}
