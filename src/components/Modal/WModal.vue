<template>
  <div class="z-[1000]">
    <Transition
      enter-active-class="fade-enter-active"
      leave-active-class="fade-leave-active"
      enter-from-class="fade-enter-from"
      leave-to-class="fade-leave-to"
    >
      <div
        v-if="isBackdropVisible"
        :style="{zIndex: 100 + modalMetaList.length + modalMetaList.length - 1}"
        class="fixed top-0 left-0 h-full w-full backdrop-blur bg-primary-light dark:bg-primary-darkest bg-opacity-40 dark:bg-opacity-40"
      />
    </Transition>

    <TransitionGroup
      enter-active-class="pop-up-enter-active"
      leave-active-class="pop-up-leave-active"
      enter-from-class="pop-up-enter-from"
      leave-to-class="pop-up-leave-to"
    >
      <div
        v-for="(modalMeta, index) in modalMetaList"
        :key="modalMeta.key"
        :style="{zIndex: 100 + index + index + 2}"
        class="fixed top-0 left-0 h-full w-full flex justify-center items-center overscroll-none overflow-y-auto no-scrollbar"
      >
        <div class="h-[calc(100%+1px)]" />
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
}

const key = ref(0)
const modalMetaList = ref<ModalMeta[]>([])
const isBackdropVisible = ref(false)

const addModal: AddModal = (component: VueComponent, props?: Record<string, unknown>): () => ReturnType<typeof closeModal> => {
  const modalMeta = {
    component,
    key: key.value++,
    props,
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
