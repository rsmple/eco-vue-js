<template>
  <div class="z-[1000]">
    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isBackdropVisible"
        :style="{zIndex: 100 + modalMetaList.length + modalMetaList.length - 1}"
        class="fixed top-0 left-0 h-full w-full backdrop-blur bg-primary-light dark:bg-primary-darkest bg-opacity-40 dark:bg-opacity-40"
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
        :style="{zIndex: 100 + index + index + 2}"
        class="fixed top-0 left-0 bottom-0 right-0 flex justify-center items-center overscroll-none overflow-y-auto no-scrollbar isolate"
      >
        <div class="h-[calc(100%+1px)]" />

        <ModalCloseButton @click.stop.prevent="closeModalWithConfirm(modalMeta)" />

        <component
          :is="modalMeta.component"
          v-bind="modalMeta.props"
          @close:modal="closeModal(modalMeta)"
          @update:has-changes="hasChangesMap[modalMeta.key] = $event"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeMount, onBeforeUnmount, ref, watch, type Component, reactive} from 'vue'
import {initModal, type AddModal, Modal} from '@/utils/Modal'
import {SemanticType} from '@/utils/SemanticType'
import ModalCloseButton from './components/ModalCloseButton.vue'

type ModalMeta = {
  key: number
  component: Component
  props?: Record<string, unknown>
  cb?: () => void
  autoclose: boolean
}

const key = ref(0)
const modalMetaList = ref<ModalMeta[]>([])
const isBackdropVisible = ref(false)
const hasChangesMap = reactive<Record<number, boolean>>({})

const addModal: AddModal = (component: Component, props?: Record<string, unknown>, cb?: () => void, autoclose = false): () => ReturnType<typeof closeModal> => {
  const modalMeta = {
    component,
    key: key.value++,
    props,
    cb,
    autoclose,
  }

  modalMetaList.value = [...modalMetaList.value, modalMeta]

  return () => closeModal(modalMeta)
}

const closeModal = (modalMeta: ModalMeta): void => {
  const index = modalMetaList.value.indexOf(modalMeta)

  if (index === -1) return

  const modalMetaListNew = modalMetaList.value.slice()

  modalMetaListNew.splice(index, 1)

  modalMetaList.value = modalMetaListNew
  delete hasChangesMap[modalMeta.key]

  if (!modalMetaListNew.length) {
    key.value = 0
  }

  modalMeta.cb?.()
}

let closeConfirm: (() => void) | null = null

const closeModalWithConfirm = (modalMeta: ModalMeta): void => {
  if (modalMeta.autoclose || !hasChangesMap[modalMeta.key]) {
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
    isBackdropVisible.value = true
  } else {
    timeout = setTimeout(() => {
      timeout = undefined
      isBackdropVisible.value = false
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
