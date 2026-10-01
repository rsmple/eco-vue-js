<template>
  <div class="grid max-w-full grid-cols-[1fr_auto] gap-4">
    <div
      tabindex="0"
      class="group/hover-circle relative select-none px-4 py-3.5"
      :class="{
        'cursor-not-allowed': disabled,
        'cursor-grab': !disabled && !readonly,
      }"
      @mousedown.prevent.stop="startMove"
      @touchstart.prevent.stop="startMove"
    >
      <div
        ref="wrapper"
        class="h-1 w-full rounded-sm bg-track"
      >
        <div
          class="flex h-full items-center justify-end rounded-inherit"
          :class="{
            [semanticTypeBackgroundMap[errorMessage ? SemanticType.NEGATIVE : semanticType]]: !disabled,
            'bg-track-strong': disabled,
          }"
          :style="{width: percentCompactFormatter.format(rangeScale(cursor ?? modelValue))}"
        >
          <div
            class="square-4 relative right-0 -mr-2 rounded-full bg-inherit transition-transform"
            :class="{
              'scale-180': isMoveStarted,
              'hover:scale-200': !readonly && !isMoveStarted,
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
          class="tone-negative text-tone absolute -bottom-4 right-0 pt-0.5 text-xs font-normal"
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
import {SemanticType, useSemanticTypeBackgroundMap} from '@/utils/SemanticType'
import {percentCompactFormatter} from '@/utils/utils'

const POINTER_EVENTS_NONE_CLASS = 'pointer-events-none'

const props = withDefaults(
  defineProps<{
    /** Picked value, from `min` to `max`. */
    modelValue: number
    /** Value at the left end. */
    min?: number
    /** Value at the right end. */
    max?: number
    /** Values snap to steps of this size from `min`. */
    step?: number
    /** Color of the filled part. */
    semanticType?: SemanticType
    /** Grays the slider out and stops dragging. */
    disabled?: boolean
    /** Stops dragging. */
    readonly?: boolean
    /** Error shown under the slider. The filled part turns red. */
    errorMessage?: string
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
  /** The value where dragging ended. */
  (e: 'update:model-value', value: number): void
  /** The value under the pointer while dragging, for showing it before it is picked. */
  (e: 'update-eager:model-value', value: number): void
}>()

defineSlots<{
  /** Content to the right of the slider, such as the value. */
  right?: () => void
}>()

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()

const cursor = ref<number | undefined>()

const wrapperRef = useTemplateRef('wrapper')
const isMoveStarted = ref(false)
const domListenerContainer = new DOMListenerContainer()
const rect = ref<DOMRect | undefined>()

const range = computed(() => props.max - props.min)

const rangeToRect = computed<number | undefined>(() => rect.value && rect.value.width !== 0 ? range.value / rect.value.width : undefined)

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

  if (start < 0) {
    cursor.value = props.min
    return
  }

  if (start > rect.value.width) {
    cursor.value = props.max
    return
  }

  const value = props.min + rangeToRect.value * start

  cursor.value = Math.min(props.max, props.min + Math.round((value - props.min) / props.step) * props.step)
}

const startMove = (event: MouseEvent | TouchEvent): void => {
  if (props.readonly || props.disabled) return

  isMoveStarted.value = true

  rect.value = wrapperRef.value?.getBoundingClientRect()

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

  if (cursor.value !== undefined) emit('update:model-value', cursor.value)

  isMoveStarted.value = false
  rect.value = undefined
  cursor.value = undefined

  document.documentElement.style.setProperty('cursor', null)
  document.body.classList.remove(POINTER_EVENTS_NONE_CLASS)

  domListenerContainer.destroy()
}

watch(cursor, value => {
  if (props.readonly || props.disabled) return
  if (value === undefined) return

  emit('update-eager:model-value', value)
})

onBeforeUnmount(() => {
  endMove()
})
</script>