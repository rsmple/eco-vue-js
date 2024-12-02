<template>
  <button
    ref="button"
    class="text-description grid cursor-pointer select-none snap-center grid-cols-[1fr,auto] font-semibold outline-none transition-colors duration-500"
    @click="$emit('click', $event)"
  >
    <div
      class="w-ripple w-ripple-hover relative" 
      :class="{
        'text-primary-default dark:text-primary-dark': active && !hasError,
        'text-negative dark:text-negative-dark': hasError,
      }"
    >
      <slot
        v-if="$slots.title"
        name="title"
      />

      <div
        v-else
        class="flex items-center"
        :class="{
          'h-10 justify-center text-center': !side,
          'py-3 text-start': side,
        }"
      >
        <div class="whitespace-nowrap px-4">
          <Suspense v-if="icon !== undefined">
            <component 
              :is="icon"
              class="square-5 -mt-1 inline"
            />

            <template #fallback>
              <svg class="square-5 -mt-1 inline">
                <g />
              </svg>
            </template>
          </Suspense>
          {{ title }}
          <slot name="suffix" />
        </div>
      </div>
  
      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="hasChanges"
          class="square-2 absolute right-0 top-0 rounded-full transition-colors duration-500"
          :class="{
            'bg-info dark:bg-info-dark': !hasError,
            'bg-negative dark:bg-negative-dark': hasError,
          }"
        />
      </Transition>
    </div>

    <slot name="right" />
  </button>
</template>

<script setup lang="ts">
import {type CSSProperties, nextTick, onMounted, useTemplateRef, watch} from 'vue'

const props = defineProps<{
  active: boolean
  index: number
  hasError: boolean
  hasChanges: boolean
  title: string
  icon: SVGComponent | undefined
  side?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'update:indicator-style', value: CSSProperties): void
  (e: 'update:scroll-position', value: {left: number} | {top: number}): void
}>()

const buttonRef = useTemplateRef('button')

const updateIndicator = (): void => {
  if (!props.active) return
  if (!buttonRef.value || !buttonRef.value.offsetWidth) return

  if (props.side) {
    emit('update:indicator-style', {
      height: buttonRef.value.offsetHeight + 'px',
      top: buttonRef.value.offsetTop + 'px',
      left: '0',
      width: '0.25rem',
    })
  } else {
    emit('update:indicator-style', {
      width: buttonRef.value.offsetWidth + 'px',
      left: buttonRef.value.offsetLeft + 'px',
      bottom: '0',
      height: '0.25rem',
    })
  }
}

const updateScrollPosition = (): void => {
  if (!props.active) return
  if (!buttonRef.value || !buttonRef.value.offsetWidth) return

  if (props.side) {
    emit('update:scroll-position', {top: buttonRef.value.offsetTop})
  } else {
    emit('update:scroll-position', {left: buttonRef.value.offsetLeft})
  }
}

const update = () => {
  updateIndicator()
  updateScrollPosition()
}

watch(() => props.active, () => {
  update()
})

watch(() => props.index, () => {
  nextTick(update)
})

onMounted(() => {
  update()
})

defineExpose({
  update,
})
</script>