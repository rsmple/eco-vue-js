import type {NotifyCenterProps} from '../types'

import {type VNode, h, markRaw, readonly} from 'vue'

import {type OverlayAnchor, useOverlay} from '@/utils/Overlay'

import WNotifyCenter from '../WNotifyCenter.vue'
import {closeNotifyCenter, isNotifyCenterOpen, setNotifyCenterClose} from '../models/notifyCenter'

type NotifyCenterOptions = {
  /** Props of WNotifyCenter, read while it renders. */
  props?: () => NotifyCenterProps
  /** Footer of WNotifyCenter, such as a component's slot. */
  footer?: () => VNode[] | undefined
}

/**
 * Opens WNotifyCenter as a dropdown at an anchor — a bottom sheet on phones — for a custom trigger. Called in setup; needs WModal on the page.
 * Toasts are hidden while it is open. WNotifyCenterButton is a ready trigger for the actions bar.
 */
export const useNotifyCenter = (options: NotifyCenterOptions = {}) => {
  const overlay = useOverlay()

  // The overlay host renders it, as a component so the footer keeps the caller's context.
  const content = markRaw(() => h(WNotifyCenter, options.props?.(), options.footer ? {footer: options.footer} : undefined))

  let closeCenter: (() => void) | null = null

  const open = (anchor: OverlayAnchor): void => {
    const value: (() => void) | null = overlay.open({
      present: 'dropdown',
      anchor,
      content,
      dropdown: {frameClass: 'w-dropdown-frame min-h-0 max-h-160 w-[min(28rem,calc(100vw-1rem))]'},
      onClose: () => {
        if (closeCenter !== value) return

        closeCenter = null
        isNotifyCenterOpen.value = false
        setNotifyCenterClose(null)
      },
    })

    closeCenter = value
    isNotifyCenterOpen.value = value !== null
    setNotifyCenterClose(value)
  }

  /** Closes the center if it is open, from here or elsewhere, and opens it at `anchor` otherwise. */
  const toggle = (anchor: OverlayAnchor): void => {
    if (isNotifyCenterOpen.value) closeNotifyCenter()
    else open(anchor)
  }

  return {
    isOpen: readonly(isNotifyCenterOpen),
    open,
    close: closeNotifyCenter,
    toggle,
  }
}
