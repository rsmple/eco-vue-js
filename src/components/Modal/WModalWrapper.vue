<template>
  <div
    class="bg-default dark:bg-default-dark shadow-md rounded-3xl w-[var(--modal-wrapper-width,35rem)] max-h-full overflow-hidden group"
    :class="{
      'max-w-[calc(100%-var(--inner-margin)*2)] -mx--inner-margin': !maximized,
      'max-w-full rounded-none mb-8': maximized,
    }"
  >
    <div
      ref="title"
      class="text-accent font-semibold text-center px-[var(--modal-wrapper-padding,2rem)]"
      :class="{
        'py-2 text-xl': maximized,
        'py-8 text-2xl': !maximized,
      }"
    >
      <slot name="title" />
    </div>

    <div
      ref="container"
      class="overflow-y-overlay overflow-x-hidden max-h-[calc(100vh-var(--modal-wrapper-margin-y)-2rem)] px-[var(--modal-wrapper-padding,2rem)]"
      :style="{'--modal-wrapper-margin-y': marginY + 'px'}"
    >
      <slot />
    </div>

    <div
      ref="actions"
      class="flex justify-center p-[var(--modal-wrapper-padding,2rem)] gap-[var(--modal-wrapper-padding,2rem)] flex-col sm:flex-row"
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
