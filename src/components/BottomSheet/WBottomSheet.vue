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
          ref="wrapper"
          class="
            fixed top-0 left-0 h-full w-full z-[1000] backdrop-blur bg-primary-light dark:bg-primary-darkest bg-opacity-40 dark:bg-opacity-40
            overscroll-contain overflow-y-auto no-scrollbar snap-y snap-mandatory snap-always scroll-smooth overflow-scroll
          "
        >
          <div
            ref="backdrop"
            class="height-full snap-start"
            @click="hide"
          />

          <div
            ref="content"
            class="h-4/5 max-h-[80%] bg-default dark:bg-default-dark rounded-t-3xl shadow-md snap-end"
          >
            <div
              ref="toggle"
              class="px-3"
            >
              <div class="h-9 flex justify-center items-center">
                <div
                  class="h-1 w-12 rounded-sm"
                  :class="{
                    'bg-gray-300': !swipeStarted,
                    'bg-primary-default dark:bg-primary-dark': swipeStarted,
                  }"
                />
              </div>

              <slot
                name="toggle"
                :unclickable="false"
              />
            </div>

            <div
              ref="container"
              class="max-h-[calc(100%-var(--bottom-sheet-toggle-height))] overflow-x-hidden overflow-y-auto overscroll-contain"
              :style="{'--bottom-sheet-toggle-height': toggleHeight + 'px'}"
            >
              <slot name="content" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {enablePreventScroll} from '@/utils/preventScroll'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const toggle = ref<HTMLDivElement | undefined>()
const wrapper = ref<HTMLDivElement | undefined>()
const container = ref<HTMLDivElement | undefined>()
const backdrop = ref<HTMLDivElement | undefined>()
const content = ref<HTMLDivElement | undefined>()

const toggleHeight = ref(0)
const swipeStarted = ref(false)

const hide = () => {
  backdrop.value?.scrollIntoView({behavior: 'smooth', block: 'start'})
}

const show = () => {
  content.value?.scrollIntoView({behavior: 'smooth', block: 'end'})
}

const updatePadding = () => {
  if (!toggle.value) return

  toggleHeight.value = toggle.value.getBoundingClientRect().height + 16
}

const observerCb = (entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    if (entry.target === backdrop.value && entry.isIntersecting) {
      emit('close')
    }
  })
}

const observer = new IntersectionObserver(observerCb, {
  root: null,
  threshold: 0.9,
})

let resumeScroll: (() => void) | undefined

watch(toggle, updatePadding)

watch(container, value => {
  resumeScroll?.()

  if (value && wrapper.value) {
    resumeScroll = enablePreventScroll([value, wrapper.value])
  }
}, {immediate: true})

let timeout: NodeJS.Timeout

watch(backdrop, (value, oldValue) => {
  if (oldValue) observer.unobserve(oldValue)

  if (value) {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      observer.observe(value)
    }, 500)
  }
})

onMounted(() => {
  updatePadding()
})

onBeforeUnmount(() => {
  resumeScroll?.()
  observer.disconnect()
})

defineExpose({
  updateDropdown: () => {
    updatePadding()
  },
})

</script>
