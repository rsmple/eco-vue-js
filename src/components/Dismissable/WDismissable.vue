<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    @after-enter="show"
  >
    <button
      v-if="isOpen"
      ref="container"
      class="no-scrollbar snap-y snap-mandatory snap-always overflow-scroll overflow-y-auto overscroll-contain scroll-smooth text-start"
      @click="hide"
    >
      <div class="height-full snap-start" />

      <div
        ref="content"
        class="snap-end"
        :class="contentClass"
      >
        <slot />
      </div>
    </button>
  </Transition>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, useTemplateRef, watch} from 'vue'

defineProps<{
  isOpen: boolean
  contentClass?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const containerRef = useTemplateRef('container')
const contentRef = useTemplateRef('content')

const hide = () => {
  containerRef.value?.scrollTo({top: 0, behavior: 'smooth'})
}

const show = () => {
  containerRef.value?.scrollTo({top: containerRef.value.offsetHeight, behavior: 'smooth'})
}

const observerCb = (entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    if (entry.target === contentRef.value && !entry.isIntersecting) {
      emit('close')
    }
  })
}

const observer = new IntersectionObserver(observerCb, {
  root: null,
  threshold: 0.3,
})

let timeout: NodeJS.Timeout

watch(contentRef, (value, oldValue) => {
  if (oldValue) observer.unobserve(oldValue)

  if (value) {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      observer.observe(value)
    }, 500)
  }
})

onBeforeUnmount(() => {
  observer.disconnect()
})
</script>
