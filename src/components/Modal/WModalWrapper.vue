<template>
  <div
    class="bg-default dark:bg-default-dark shadow-md rounded-3xl py-8 w-[35rem] max-h-full overflow-hidden group"
    :class="{
      'max-w-[calc(100%-var(--inner-margin)*2)] -mx--inner-margin': !maximized,
      'm-0 max-w-full rounded-none': maximized,
      maximized,
    }"
  >
    <div class="text-accent text-2xl font-semibold text-center mb-8 px-8 group-[.maximized]:px-4">
      <slot name="title" />
    </div>

    <div
      ref="container"
      class="overflow-y-overlay overflow-x-hidden px-8 group-[.maximized]:px-4 overflow-scroll max-h-[calc(100vh-17.25rem)] sm:max-h-[calc(100vh-12.875rem)]"
    >
      <slot />
    </div>

    <div class="flex justify-center mt-8 gap-y-6 gap-x-8 flex-col sm:flex-row px-8 group-[.maximized]:px-4">
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
let resumeScroll: (() => void) | undefined

onMounted(() => {
  if (container.value) {
    resumeScroll = enablePreventScroll([container.value])
  }
})

onBeforeUnmount(() => {
  resumeScroll?.()
})

</script>
