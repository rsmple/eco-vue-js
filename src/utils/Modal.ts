import {defineAsyncComponent, markRaw} from 'vue'
import type {ConfirmModalProps} from '@/components/Modal/modals/Confirm/types'

export type AddModal = (component: VueComponent, props?: Record<string, unknown>) => (() => void)

let addModal: AddModal | undefined

export const initModal = (value: AddModal | undefined) => {
  addModal = value
}

export const Modal = {
  add(component: VueComponent, props?: Record<string, unknown>): (() => void) | null {
    return addModal?.(component, props) ?? null
  },

  addConfirm(props: ConfirmModalProps): (() => void) | null {
    return addModal?.(
      markRaw(defineAsyncComponent(() => import('@/components/Modal/modals/Confirm/ConfirmModal.vue'))),
      props,
    ) ?? null
  },
}
