<template>
  <div>
    <slot
      name="toggle"
      :unclickable="true"
    />

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        @after-enter="show"
      >
        <div
          v-if="isOpen"
          class="
            bg-primary-light dark:bg-primary-darkest no-scrollbar fixed left-0 top-0 size-full snap-y snap-mandatory snap-always
            overflow-scroll overflow-y-auto overscroll-contain scroll-smooth bg-opacity-40 backdrop-blur dark:bg-opacity-40
          "
          :style="{zIndex: baseZIndex + BASE_ZINDEX_DROPDOWN}"
        >
          <div
            ref="backdrop"
            class="height-full snap-start"
            @click="hide"
          />

          <div
            ref="content"
            class="height-[90%] bg-default dark:bg-default-dark relative grid snap-end grid-cols-[1fr] grid-rows-[auto,1fr] rounded-t-3xl shadow-md"
          >
            <div class="px-3">
              <div class="flex h-9 items-center justify-center">
                <div
                  class="h-1 w-12 rounded-sm"
                  :class="{
                    'bg-gray-300': !swipeStarted,
                    'bg-primary dark:bg-primary-dark': swipeStarted,
                  }"
                />
              </div>

              <slot
                name="toggle"
                :unclickable="false"
              />
            </div>

            <div class="overflow-y-auto overflow-x-hidden overscroll-contain">
              <slot name="content" />
            </div>

            <div class="absolute top-full h-screen w-full bg-[inherit]" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import {inject, onBeforeUnmount, ref, useTemplateRef, watch} from 'vue'

import {BASE_ZINDEX_DROPDOWN, wBaseZIndex} from '@/utils/utils'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const baseZIndex = inject(wBaseZIndex, 0)

const backdropRef = useTemplateRef('backdrop')
const contentRef = useTemplateRef('content')

const swipeStarted = ref(false)

const hide = () => {
  backdropRef.value?.scrollIntoView({behavior: 'smooth', block: 'start'})
}

const show = () => {
  contentRef.value?.scrollIntoView({behavior: 'smooth', block: 'end'})
}

const observerCb = (entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    if (entry.target === backdropRef.value && entry.isIntersecting) {
      emit('close')
    }
  })
}

const observer = new IntersectionObserver(observerCb, {
  root: null,
  threshold: 0.9,
})

let timeout: NodeJS.Timeout

watch(backdropRef, (value, oldValue) => {
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
