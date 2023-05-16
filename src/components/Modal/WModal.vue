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
      enter-active-class="transition-all duration-500"
      leave-active-class="transition-all duration-500"
      enter-from-class="scale-50 translate-y-5 opacity-0"
      leave-to-class="scale-50 opacity-0"
    >
      <div
        v-for="(modalMeta, index) in modalMetaList"
        :key="modalMeta.key"
        :style="{zIndex: 100 + index + index + 2}"
        class="fixed top-0 left-0 bottom-0 right-0 flex justify-center items-center overscroll-none overflow-y-auto no-scrollbar isolate"
      >
        <div class="h-[calc(100%+1px)]" />

        <button
          v-if="modalMeta.autoclose"
          class="cursor-pointer absolute top-0 left-0 h-full w-full -z-10"
          title="Click outside to close modal"
          @click.stop.prevent="closeModal(modalMeta)"
        />

        <component
          :is="modalMeta.component"
          v-bind="modalMeta.props"
          @close:modal="closeModal(modalMeta)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeMount, onBeforeUnmount, ref, watch} from 'vue'
import {initModal, type AddModal} from '@/utils/Modal'

type ModalMeta = {
  key: number
  component: VueComponent
  props?: Record<string, unknown>
  cb?: () => void
  autoclose: boolean
}

const key = ref(0)
const modalMetaList = ref<ModalMeta[]>([])
const isBackdropVisible = ref(false)

const addModal: AddModal = (component: VueComponent, props?: Record<string, unknown>, cb?: () => void, autoclose = false): () => ReturnType<typeof closeModal> => {
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

  if (!modalMetaListNew.length) {
    key.value = 0
  }

  modalMeta.cb?.()
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
