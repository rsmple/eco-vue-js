<template>
  <div>
    <div
      v-if="title"
      class="text-accent mb-2 text-xs font-semibold"
    >
      <template v-if="!skeleton">
        {{ title }}
      </template>

      <WSkeleton v-else />
    </div>

    <button
      v-if="!skeleton && modelValue"
      class="
      w-ripple w-ripple-hover text-black-default w-ripple-opacity-20 dark:w-ripple-opacity-30 group/image-button relative isolate h-28
      w-40 cursor-pointer overflow-hidden rounded-lg border border-solid
      border-gray-100 bg-cover bg-center outline-none dark:border-gray-800
    "
      :style="{backgroundImage: `url(${modelValue})`}"
      @click="openModal"
    >
      <div class="opacity-0 transition-opacity group-hover/image-button:opacity-100">
        <div class="text-default font-roboto relative z-10 font-extrabold tracking-widest">
          VIEW
        </div>

        <div
          class="
          text-default bg-black-default absolute bottom-0 mt-1 w-full overflow-hidden
          text-ellipsis bg-opacity-50 px-1 text-start text-xs [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box]
        "
        >
          {{ modelValue.substring(modelValue.lastIndexOf('/') + 1) }}
        </div>
      </div>
    </button>

    <WSkeleton
      v-else
      class="w-skeleton-w-40 w-skeleton-h-28 w-skeleton-rounded-lg"
    />
  </div>
</template>

<script lang="ts" setup>
import {defineAsyncComponent, markRaw} from 'vue'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {Modal} from '@/utils/Modal'

const ImageModal = defineAsyncComponent(() => import('./components/ImageModal.vue'))

const props = defineProps<{
  modelValue?: string
  title?: string
  skeleton?: boolean
}>()

let closeModal: null | (() => void) = null

const openModal = (): void => {
  if (!props.modelValue) return

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