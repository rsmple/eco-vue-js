import type {ConfirmModalProps} from '@/components/Modal/types'

import {type Component, type ComponentOptions, type MethodOptions, defineAsyncComponent, markRaw} from 'vue'

const ConfirmModal = defineAsyncComponent(() => import('@/components/Modal/modals/Confirm/ConfirmModal.vue'))

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

export type AddModal<Props> = (component: ModalComponent<Props>, props?: Props, cb?: () => void, autoclose?: boolean) => (() => void)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let addModal: AddModal<any> | undefined

export const initModal = <Props>(value: AddModal<Props> | undefined) => {
  addModal = value
}

export const Modal = {
  add<Props>(component: ModalComponent<Props>, props?: Props, cb?: () => void): (() => void) | null {
    return addModal?.(component, props, cb, false) ?? null
  },

  addAutoclosable<Props>(component: ModalComponent<Props>, props?: Props, cb?: () => void): (() => void) | null {
    return addModal?.(component, props, cb, true) ?? null
  },

  addConfirm(props: ConfirmModalProps, cb?: () => void): (() => void) | null {
    return addModal?.(
      markRaw(ConfirmModal),
      props,
      cb,
      true,
    ) ?? null
  },
}
