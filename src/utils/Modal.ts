import {defineAsyncComponent, markRaw} from 'vue'
import type {ConfirmModalProps} from '@/components/Modal/modals/Confirm/types'

const ConfirmModal = defineAsyncComponent(() => import('@/components/Modal/modals/Confirm/ConfirmModal.vue'))

export type AddModal = (component: VueComponent, props?: Record<string, unknown>, cb?: () => void, autoclose?: boolean) => (() => void)

let addModal: AddModal | undefined

export const initModal = (value: AddModal | undefined) => {
  addModal = value
}

export const Modal = {
  add(component: VueComponent, props?: Record<string, unknown>, cb?: () => void): (() => void) | null {
    return addModal?.(component, props, cb, false) ?? null
  },

  addAutoclosable(component: VueComponent, props?: Record<string, unknown>, cb?: () => void): (() => void) | null {
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
