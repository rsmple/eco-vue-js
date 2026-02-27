<template>
  <div :style="{zIndex: BASE_ZINDEX_MODAL}">
    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isBackdrop"
        :style="{zIndex: 99 + modalMetaList.length + modalMetaList.length}"
        class="bg-primary-light/40 dark:bg-primary-darkest/40 fixed inset-0 backdrop-blur"
      />
    </Transition>

    <TransitionGroup
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="translate-y-8 opacity-0"
      leave-to-class="-translate-y-5 opacity-0"
    >
      <div
        v-for="(modalMeta, index) in modalMetaList"
        :key="modalMeta.key"
        :style="{zIndex: 102 + index}"
        class="no-scrollbar fixed inset-0 isolate flex items-center justify-center overflow-y-auto overscroll-none"
      >
        <div class="h-[calc(100%+1px)]" />

        <ModalCloseButton @click.stop.prevent="closeModalWithConfirm(modalMeta, index)" />

        <component
          :is="modalMeta.component"
          ref="modalComponent"
          v-bind="modalMeta.props"
          @close:modal="closeModal(modalMeta)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeMount, onBeforeUnmount, provide, reactive, ref, useTemplateRef, watch} from 'vue'

import {Modal, type ModalComponent, initModal} from '@/utils/Modal'
import {SemanticType} from '@/utils/SemanticType'
import {BASE_ZINDEX_MODAL, wBaseZIndex} from '@/utils/utils'

import ModalCloseButton from './components/ModalCloseButton.vue'
import {wIsModal} from './models/injection'
import {useIsBackdrop} from './use/useIsBackdrop'

type ModalMeta<ModalProps> = {
  key: string
  component: ModalComponent<unknown>
  props?: ModalProps
  cb?: () => void
  autoclose: boolean
}

provide(wBaseZIndex, BASE_ZINDEX_MODAL)
provide(wIsModal, true)
 
let key = 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modalMetaList = ref<ModalMeta<any>[]>([])
const isBackdrop = useIsBackdrop()
const modalComponentRef = useTemplateRef<ComponentInstance<ModalComponent<unknown>>[]>('modalComponent')
const hasChangesMap = reactive<Record<string, boolean>>({})

type Cb = () => void
type CloseModal = () => ReturnType<typeof closeModal>

const addModal = (component: ModalComponent<unknown>, props?: unknown, cb?: Cb, autoclose = false): CloseModal => {
  const modalMeta = {
    component,
    key: `w-modal-${ key++ }`,
    props,
    cb,
    autoclose,
  }

  modalMetaList.value = [...modalMetaList.value, modalMeta]

  return () => closeModal(modalMeta)
}

const closeModal = (modalMeta: ModalMeta<unknown>): void => {
  const index = modalMetaList.value.indexOf(modalMeta)

  if (index === -1) return

  const modalMetaListNew = modalMetaList.value.slice()

  modalMetaListNew.splice(index, 1)

  modalMetaList.value = modalMetaListNew
  delete hasChangesMap[modalMeta.key]

  if (modalMetaListNew.length === 0) key = 0

  modalMeta.cb?.()
}

let closeConfirm: (() => void) | null = null

const closeModalWithConfirm = (modalMeta: ModalMeta<unknown>, index: number): void => {
  if (modalMeta.autoclose || (!hasChangesMap[modalMeta.key] && !modalComponentRef.value?.[index]?.formRef?.hasChanges)) {
    closeModal(modalMeta)
    return
  }

  closeConfirm?.()

  closeConfirm = Modal.addConfirm({
    title: 'Are you sure want to close modal?',
    description: 'Closing the modal will undo any changes',
    acceptSemanticType: SemanticType.WARNING,
    acceptText: 'Close',
    onAccept() {
      closeModal(modalMeta)
    },
  }, () => closeConfirm = null)
}

let timeout: NodeJS.Timeout | undefined

watch(modalMetaList, value => {
  if (timeout) clearTimeout(timeout)

  if (value.length) {
    isBackdrop.value = true
  } else {
    timeout = setTimeout(() => {
      timeout = undefined
      isBackdrop.value = false
    }, 100)
  }
})

onBeforeMount(() => {
  initModal(addModal)
})

onBeforeUnmount(() => {
  initModal(undefined)
})
</script>
