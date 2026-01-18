<template>
  <div class="grid max-w-full grid-cols-[1fr,auto] gap-4">
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
        class="h-1 w-full rounded-sm bg-gray-300 dark:bg-gray-600"
      >
        <div
          class="flex h-full items-center justify-end rounded-[inherit]"
          :class="{
            [!errorMessage ? semanticType : SemanticType.NEGATIVE]: !disabled,
            'bg-gray-400 dark:bg-gray-500': disabled,
          }"
          :style="{width: percentCompactFormatter.format(rangeScale(cursor ?? modelValue))}"
        >
          <div
            class="square-4 tw-hover-circle tw-hover-circle-inherit relative -mr-2 rounded-full bg-[inherit]"
            :style="{
              '--hover-circle-opacity': isMoveStarted ? 1 : 0.35,
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

const POINTER_EVENTS_NONE_CLASS = 'pointer-events-none'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    semanticType?: SemanticType
    disabled?: boolean
    readonly?: boolean
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
  (e: 'update:modelValue', value: number): void
  (e: 'update-eager:modelValue', value: number): void
}>()

const cursor = ref<number | undefined>()

const wrapperRef = useTemplateRef('wrapper')
const isMoveStarted = ref(false)
const domListenerContainer = new DOMListenerContainer()
const rect = ref<DOMRect | undefined>()

const range = computed(() => props.max - props.min)

const rectMin = computed(() => props.min + props.step / 2)
const rangeToRect = computed<number | undefined>(() => rect.value && rect.value.width !== 0 ? range.value / rect.value.width : undefined)

const rangeScale = (value: number): number => {
  return (props.min + value) / range.value
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

  const value = rectMin.value + rangeToRect.value * start

  cursor.value = value - value % props.step
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

  if (cursor.value !== undefined) emit('update:modelValue', cursor.value)

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

  emit('update-eager:modelValue', value)
})

onBeforeUnmount(() => {
  endMove()
})
</script>