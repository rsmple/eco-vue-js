<template>
  <div>
    <div
      v-if="title"
      class="text-xs font-semibold text-accent mb-2"
    >
      <template v-if="!skeleton">
        {{ title }}
      </template>

      <WSkeleton v-else />
    </div>

    <button
      v-if="!skeleton && modelValue"
      class="
      w-40 h-28 rounded-lg w-ripple w-ripple-hover text-black-default cursor-pointer relative overflow-hidden
      w-ripple-opacity-20 dark:w-ripple-opacity-30 isolate group/image-button bg-center bg-cover
      border border-solid border-gray-100 dark:border-gray-800 outline-none
    "
      :style="{backgroundImage: `url(${modelValue})`}"
      @click="openModal"
    >
      <div class="opacity-0 group-hover/image-button:opacity-100 transition-opacity">
        <div class="text-default font-extrabold z-10 relative tracking-widest font-roboto">
          VIEW
        </div>

        <div
          class="
          text-xs mt-1 text-ellipsis overflow-hidden [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]
          absolute bottom-0 w-full text-default bg-black-default bg-opacity-50 text-start px-1
        "
        >
          {{ modelValue.substring(modelValue.lastIndexOf('/') + 1) }}
        </div>
      </div>
    </button>

    <WSkeleton
      v-else
      class="width-40 h-28 rounded-lg"
    />
  </div>
</template>

<script lang="ts" setup>
import {defineAsyncComponent, markRaw} from 'vue'
import {Modal} from '@/utils/Modal'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

const ImageModal = defineAsyncComponent(() => import('./components/ImageModal.vue'))

const props = defineProps<{
  modelValue?: string
  title?: string
  skeleton?: boolean
}>()

let closeModal: null | (() => void) = null

const openModal = (): void => {
  closeModal?.()

  closeModal = Modal.addAutoclosable(
    markRaw(ImageModal),
    {
      modelValue: props.modelValue,
    },
    () => closeModal = null,
  )
}

</script>