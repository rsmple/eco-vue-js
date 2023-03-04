<template>
  <div
    class="bg-default dark:bg-default-dark shadow-md rounded-3xl w-[var(--modal-wrapper-width,35rem)] max-h-full overflow-hidden group"
    :class="{
      'max-w-[calc(100%-var(--inner-margin)*2)] -mx--inner-margin': !maximized,
      'm-0 max-w-full rounded-none': maximized,
      maximized,
    }"
  >
    <div
      ref="title"
      class="text-accent text-2xl font-semibold text-center py-8 px-8 group-[.maximized]:px-4"
    >
      <slot name="title" />
    </div>

    <div
      ref="container"
      class="overflow-y-overlay overflow-x-hidden px-8 group-[.maximized]:px-4 overflow-scroll max-h-[calc(100vh-var(--modal-wrapper-margin-y)-2rem)]"
      :style="{'--modal-wrapper-margin-y': marginY + 'px'}"
    >
      <slot />
    </div>

    <div
      ref="actions"
      class="flex justify-center py-8 gap-y-6 gap-x-8 flex-col sm:flex-row px-8 group-[.maximized]:px-4"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {enablePreventScroll} from '@/utils/preventScroll'

defineProps<{
  maximized?: boolean
}>()

const container = ref<HTMLDivElement | undefined>()
const title = ref<HTMLDivElement | undefined>()
const actions = ref<HTMLDivElement | undefined>()
const marginY = ref(276)

let resumeScroll: (() => void) | undefined

onMounted(async () => {
  if (container.value) {
    resumeScroll = enablePreventScroll([container.value])
  }

  if (title.value && actions.value) {
    marginY.value = (title.value.getBoundingClientRect().height + actions.value.getBoundingClientRect().height) * 2
  }
})

onBeforeUnmount(() => {
  resumeScroll?.()
})

</script>
