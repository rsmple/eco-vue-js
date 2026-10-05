import type {ConfirmModalProps} from '@/components/Modal/types'

import {type Component, type ComponentOptions, type MethodOptions} from 'vue'

import {openConfirm, openModal, toClose} from '@/components/Modal/models/overlayRegistry'

export type ModalComponent<Props> = Component<
  Props,
  {formRef?: {hasChanges?: boolean}},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ComponentOptions,
  MethodOptions,
  {
    'close:modal': () => void
  }
>

/**
 * Opens modals on the page, from anywhere. In a component, `useOverlay` does the same for the overlay it is in —
 * a modal opened from a modal closes with it, and a confirm opened from a menu sticks to the menu's anchor.
 */
export const Modal = {
  add<Props>(component: ModalComponent<Props>, props?: Props, cb?: () => void): (() => void) | null {
    return toClose(openModal(component, props, cb, false, {parent: null}))
  },

  addAutoclosable<Props>(component: ModalComponent<Props>, props?: Props, cb?: () => void): (() => void) | null {
    return toClose(openModal(component, props, cb, true, {parent: null}))
  },

  addConfirm(props: ConfirmModalProps, cb?: () => void): (() => void) | null {
    return toClose(openConfirm(props, cb, {parent: null}))
  },
}
