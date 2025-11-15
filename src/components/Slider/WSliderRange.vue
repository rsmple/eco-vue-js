<template>
  <div class="grid max-w-full grid-cols-[1fr,auto] gap-4">
    <div
      tabindex="0"
      class="group/hover-circle relative select-none p-4 last:col-span-2"
      :class="{
        'cursor-not-allowed': disabled,
        'cursor-grab': !disabled && !readonly,
      }"
      @mousedown.prevent.stop="startMove"
      @touchstart.prevent.stop="startMove"
    >
      <div
        ref="wrapper"
        class="relative h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-600"
      >
        <div
          class="absolute flex h-full items-center rounded-[inherit] bg-gradient-to-r from-[var(--w-slider-from)_50%] to-[var(--w-slider-to)_50%]"
          :class="{
            'bg-gray-400 dark:bg-gray-500': disabled,
          }"
          :style="{
            left: percentCompactFormatter.format(rangeScale(cursorRange.from)),
            right: percentCompactFormatter.format(1 - rangeScale(cursorRange.to)),
          }"
        >
          <div
            class="square-4 absolute left-0 -ml-2 rounded-full bg-[var(--w-slider-from)] transition-transform"
            :class="{
              'scale-180': isCursorFrom === true,
              'hover:scale-200': !readonly && isCursorFrom === null,
            }"
          />

          <div
            class="square-4 absolute right-0 -mr-2 rounded-full bg-[var(--w-slider-to)] transition-transform"
            :class="{
              'scale-180': isCursorFrom === false,
              'hover:scale-200': !readonly && isCursorFrom === null,
            }"
          />
        </div>
      </div>

      <Transition
        enter-active-class="fade-enter-active"
        leave-active-class="fade-leave-active"
        enter-from-class="fade-enter-from"
        leave-to-class="fade-leave-to"
      >
        <div
          v-if="errorMessage"
          class="text-negative dark:text-negative-dark absolute -bottom-4 right-0 pt-0.5 text-xs font-normal"
        >
          {{ errorMessage }}
        </div>
      </Transition>
    </div>

    <slot name="right" />
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, ref, useTemplateRef, watch} from 'vue'

import {DOMListenerContainer} from '@/utils/DOMListenerContainer'
import {SemanticType} from '@/utils/SemanticType'
import {percentCompactFormatter} from '@/utils/utils'

type Range = {from: number, to: number}

const POINTER_EVENTS_NONE_CLASS = 'pointer-events-none'

const props = withDefaults(
  defineProps<{
    modelValue: Range
    min?: number
    max?: number
    step?: number
    semanticType?: SemanticType
    disabled?: boolean
    readonly?: boolean
    errorMessage?: string
    noBg?: boolean
  }>(),
  {
    min: 1,
    max: 10,
    step: 1,
    semanticType: SemanticType.PRIMARY,
    errorMessage: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: Range): void
  (e: 'update-eager:modelValue', value: Range): void
}>()

const cursor = ref<number | null>(null)
const isCursorFrom = ref<boolean | null>(null)

const wrapperRef = useTemplateRef('wrapper')
const isMoveStarted = ref(false)
const domListenerContainer = new DOMListenerContainer()
const rect = ref<DOMRect | null>(null)

const range = computed(() => props.max - props.min)

const rangeToRect = computed<number | undefined>(() => rect.value && rect.value.width !== 0 ? range.value / rect.value.width : undefined)

const cursorRange = computed<Range>(() => {
  if (cursor.value === null || isCursorFrom.value === null) return props.modelValue

  if (isCursorFrom.value === true) return {
    from: cursor.value,
    to: props.modelValue && props.modelValue.to > cursor.value ? props.modelValue.to : cursor.value,
  }

  if (isCursorFrom.value === false) return {
    from: props.modelValue && props.modelValue.from < cursor.value ? props.modelValue.from : cursor.value,
    to: cursor.value,
  }

  return props.modelValue
})

const rangeScale = (value: number): number => {
  return (value - props.min) / range.value
}

const handleMove = (event: MouseEvent | TouchEvent): void => {
  if (props.readonly || props.disabled) return
  if (!rangeToRect.value || !rect.value) return

  let x: number

  if ('touches' in event){
    const touch = event.touches?.[0] || event.changedTouches?.[0]
    x = touch?.pageX ?? 0
  } else {
    x = event.clientX
  }

  const start = x - rect.value.left

  if (start <= 0) {
    cursor.value = props.min
    return
  }

  if (start >= rect.value.width) {
    cursor.value = props.max
    return
  }

  const value = props.min + rangeToRect.value * start

  if (isCursorFrom.value === null) {
    if (value <= props.modelValue.from) isCursorFrom.value = true
    else if (value >= props.modelValue.to) isCursorFrom.value = false
    else isCursorFrom.value = (value - props.modelValue.from) <= (props.modelValue.to - value)
  }

  cursor.value = Math.round(value / props.step) * props.step
}

const startMove = (event: MouseEvent | TouchEvent): void => {
  if (props.readonly || props.disabled) return

  isMoveStarted.value = true

  rect.value = wrapperRef.value?.getBoundingClientRect() ?? null

  document.documentElement.style.setProperty('cursor', 'grabbing')
  document.body.classList.add(POINTER_EVENTS_NONE_CLASS)

  domListenerContainer.addEventListener(window, 'mouseup', endMove)
  domListenerContainer.addEventListener(window, 'touchend', endMove)
  domListenerContainer.addEventListener(window, 'mousemove', handleMove as EventListener)
  domListenerContainer.addEventListener(window, 'touchmove', handleMove as EventListener)

  handleMove(event)
}

const endMove = (): void => {
  if (props.readonly || props.disabled) return

  if (cursorRange.value && cursorRange.value !== props.modelValue) emit('update:modelValue', cursorRange.value)

  isMoveStarted.value = false
  rect.value = null
  cursor.value = null
  isCursorFrom.value = null

  document.documentElement.style.setProperty('cursor', null)
  document.body.classList.remove(POINTER_EVENTS_NONE_CLASS)

  domListenerContainer.destroy()
}

watch(cursorRange, value => {
  if (props.readonly || props.disabled) return
  if (value === props.modelValue || !value) return

  emit('update-eager:modelValue', value)
})

onBeforeUnmount(() => {
  endMove()
})
</script>