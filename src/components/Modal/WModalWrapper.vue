<template>
  <div
    class="bg-default dark:bg-default-dark shadow-md rounded-3xl w-[var(--modal-wrapper-width,35rem)] max-h-full overflow-hidden group"
    :class="{
      'max-w-[calc(100%-var(--modal-wrapper-padding,2rem)*2)] -mx--inner-margin': !maximized,
      'max-w-full rounded-none h-full': maximized,
    }"
  >
    <div
      ref="title"
      class="text-accent font-semibold text-center p-[var(--modal-wrapper-padding,2rem)] bg-default dark:bg-default-dark"
      :class="{
        'text-xl': maximized,
        'text-2xl': !maximized,
      }"
    >
      <slot name="title" />
    </div>

    <div
      ref="container"
      class="overflow-y-overlay overflow-x-hidden max-h-[calc(100vh-var(--modal-wrapper-margin-y))] px-[var(--modal-wrapper-padding,2rem)]"
      :style="{'--modal-wrapper-margin-y': marginY + 'px'}"
      :class="{
        'h-full': maximized,
      }"
    >
      <slot />
    </div>

    <div
      ref="actions"
      class="flex justify-center p-[var(--modal-wrapper-padding,2rem)] gap-[var(--modal-wrapper-padding,2rem)] w-full bg-default dark:bg-default-dark"
      :class="{
        'fixed bottom-0 left-0 w-full': maximized,
        'sm-not:flex-col': !maximized,
      }"
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
    marginY.value = title.value.offsetHeight + actions.value.offsetHeight
  }
})

onBeforeUnmount(() => {
  resumeScroll?.()
})

</script>
