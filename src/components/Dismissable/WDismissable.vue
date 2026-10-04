<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    @after-enter="show"
  >
    <div
      v-if="isOpen"
      ref="container"
      class="no-scrollbar snap-y snap-mandatory snap-always overflow-scroll overflow-y-auto overscroll-contain scroll-smooth"
    >
      <button
        class="square-full snap-start"
        aria-label="Close"
        @click="hide"
      />

      <div
        ref="content"
        class="snap-end"
        :class="contentClass"
        @mousedown.stop=""
        @click.stop=""
      >
        <slot :hide="hide" />
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, useTemplateRef, watch} from 'vue'

const props = defineProps<{
  /** Shows the layer and scrolls the content into view. */
  isOpen: boolean
  /** Class of the content's box. */
  contentClass?: string
}>()

const emit = defineEmits<{
  /** The content was swiped or scrolled mostly out of view, or the space above it was clicked. Set `isOpen` to `false` on it. */
  (e: 'close'): void
}>()

defineSlots<{
  /** Content that slides up from the bottom. `hide` slides it out, which then emits `close`. */
  default?: (props: {hide: () => Promise<void>}) => void
}>()

const containerRef = useTemplateRef('container')
const contentRef = useTemplateRef('content')

// Whether the content was slid into view and not yet out, to keep it in view as it grows.
let isShown = false

/** Slides the content out. Resolves once it is out of view. */
const hide = (): Promise<void> => new Promise(resolve => {
  isShown = false

  const container = containerRef.value

  if (!container || container.scrollTop <= 0) {
    resolve()

    return
  }

  const finish = () => {
    clearTimeout(timeout)
    container.removeEventListener('scrollend', finish)

    resolve()
  }

  // Falls back to a timeout where `scrollend` is not supported.
  const timeout = setTimeout(finish, 600)

  container.addEventListener('scrollend', finish)

  container.scrollTo({top: 0, behavior: 'smooth'})
})

const show = () => {
  isShown = true

  containerRef.value?.scrollTo({top: contentRef.value?.offsetTop, behavior: 'smooth'})
}

// Content that grows once open, such as one still loading, would stay partly below the screen — and be taken as swiped out.
const resizeObserver = new ResizeObserver(() => {
  if (isShown) show()
})

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

let timeout: ReturnType<typeof setTimeout>

watch(contentRef, (value, oldValue) => {
  if (oldValue) {
    observer.unobserve(oldValue)
    resizeObserver.unobserve(oldValue)
  }

  if (value) {
    resizeObserver.observe(value)

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      observer.observe(value)
    }, 500)
  }
})

onMounted(() => {
  if (props.isOpen) show()
})

onBeforeUnmount(() => {
  observer.disconnect()
  resizeObserver.disconnect()
})

defineExpose({
  hide,
})
</script>
