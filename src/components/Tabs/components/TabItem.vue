<template>
  <div
    v-if="!removable || active || flat"
    v-show="active || flat"
    ref="element"
    :class="flat ? 'first-not:mt-12' : 'h-full'"
  >
    <div
      v-if="flat && title"
      class="text-accent mb-2 text-xl font-semibold"
    >
      {{ title }}
    </div>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, toRef, useTemplateRef, watch} from 'vue'

import {useUniformState} from '@/components/Uniform/utils/injection'

import {useTabItemActiveListener} from '../use/useTabItemActiveListener'

const props = defineProps<{
  name: string
  title: string | undefined
  active: boolean
  removable: boolean
  enableStatus: boolean
  flat: boolean
}>()

const emit = defineEmits<{
  (e: 'update:height', value: number): void
  (e: 'update:active'): void
}>()

const {hasChanges, hasValue, hasError} = props.enableStatus ? useUniformState() : {}

const {callListeners} = useTabItemActiveListener()

const elementRef = useTemplateRef('element')
const measuredHeight = ref(0)

const emitHeight = (): void => {
  if (props.flat) return

  emit('update:height', measuredHeight.value)
}

let observer: ResizeObserver | null = null

onMounted(() => {
  if (props.flat || !elementRef.value) return

  observer = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return

    const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
    if (height === 0) return

    measuredHeight.value = height
    if (props.active) emitHeight()
  })

  observer.observe(elementRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

watch(() => props.active, value => {
  if (!value) return

  emit('update:active')
  callListeners()
}, {immediate: true})

defineExpose({
  emitHeight,
  name: toRef(props, 'name'),
  hasChanges,
  hasValue,
  hasError,
})
</script>