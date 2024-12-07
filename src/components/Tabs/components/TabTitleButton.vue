<template>
  <div
    ref="container"
    class="relative grid" 
    :class="{
      'col-span-2 grid grid-cols-subgrid': side,
      'grid-cols-[1fr,auto]': !side,
    }"
  >
    <button
      :disabled="disabled"
      class="w-ripple-trigger grid select-none grid-cols-[auto,1fr] font-semibold outline-none transition-colors duration-500"
      :class="{
        'text-primary-default dark:text-primary-dark': !hasError && active,
        'text-negative dark:text-negative-dark': hasError,
        'text-positive dark:text-positive-dark': showHasValue && !active && !hasError && hasValue,
        'text-description': !active && !hasError && (showHasValue ? !hasValue : true),
        'cursor-not-allowed opacity-50': disabled,
        'cursor-pointer': !disabled,
      }"
      @click="!disabled && $emit('click', $event)"
    >
      <div
        v-if="stepper"
        class="p-8"
      >
        <div
          class="text-default dark:text-default-dark rounded-full bg-[inherit] bg-opacity-100 p-1 outline transition-[outline-width] duration-500" 
          :class="{
            'bg-negative dark:bg-negative-dark outline-negative/10 dark:outline-negative-dark/10': hasError,
            'bg-positive dark:bg-positive-dark outline-positive/10 dark:outline-positive-dark/10': !hasError && hasValue,
            'bg-gray-400 outline-gray-400/10 dark:bg-gray-600 dark:outline-gray-600/10': !hasError && !hasValue,
            'outline-[1.5rem]': active,
          }"
        >
          <IconNegativeInfo
            v-if="hasError"
            class="size-8"
          />

          <IconCheckCircle
            v-else-if="hasValue"
            class="size-8"
          />

          <IconClose
            v-else
            class="size-8"
          />
        </div>
      </div>

      <div
        class="relative col-start-2"
        :class="{
          'mt-3': stepper,
          'w-ripple w-ripple-hover': !disabled
        }"
      >
        <slot
          v-if="$slots.title"
          name="title"
          v-bind="{hasChanges, hasError, hasValue}"
        />

        <div
          v-else
          class="flex items-center"
          :class="{
            'h-10 justify-center text-center': !side,
            'py-3 text-start': side,
          }"
        >
          <div
            class="whitespace-nowrap px-4"
            :class="{
              'sm-not:-pl--inner-margin': side,
            }"
          >
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
          </div>
          <slot
            name="suffix" 
            v-bind="{hasChanges, hasError, hasValue}"
          />
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

        <div
          v-if="stepper"
          class="absolute bottom-0 h-1 w-full rounded-sm bg-current"
        />
      </div>
    </button>

    <slot
      name="right"
      v-bind="{hasChanges, hasError, hasValue}"
    />
  </div>
</template>

<script setup lang="ts">
import {type CSSProperties, nextTick, onMounted, useTemplateRef, watch} from 'vue'

import IconCheckCircle from '@/assets/icons/sax/IconCheckCircle.svg?component'
import IconClose from '@/assets/icons/sax/IconClose.svg?component'
import IconNegativeInfo from '@/assets/icons/sax/IconNegativeInfo.svg?component'

const props = defineProps<{
  active: boolean
  index: number
  hasError: boolean
  hasChanges: boolean
  hasValue: boolean
  title: string
  icon: SVGComponent | undefined
  first: boolean
  last: boolean
  disabled?: boolean
  stepper?: boolean
  showHasValue?: boolean
  noIndicator?: boolean
  side?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'update:indicator-style', value: CSSProperties): void
  (e: 'update:scroll-position', value: {left: number} | {top: number}): void
}>()

const containerRef = useTemplateRef('container')

const updateIndicator = (): void => {
  if (!props.active || props.noIndicator) return
  if (!containerRef.value || !containerRef.value.offsetWidth) return

  if (props.side) {
    emit('update:indicator-style', {
      height: containerRef.value.offsetHeight + 'px',
      top: containerRef.value.offsetTop + 'px',
      left: '0',
      width: '0.25rem',
    })
  } else {
    emit('update:indicator-style', {
      width: containerRef.value.offsetWidth + 'px',
      left: containerRef.value.offsetLeft + 'px',
      bottom: '0',
      height: '0.25rem',
    })
  }
}

const updateScrollPosition = (): void => {
  if (!props.active) return
  if (!containerRef.value || !containerRef.value.offsetWidth) return

  if (props.side) {
    emit('update:scroll-position', {top: containerRef.value.offsetTop + containerRef.value.offsetHeight / 2})
  } else {
    emit('update:scroll-position', {left: containerRef.value.offsetLeft + containerRef.value.offsetWidth / 2})
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
  document.fonts.ready.then(() => {
    update()
  })
})

defineExpose({
  update,
})
</script>