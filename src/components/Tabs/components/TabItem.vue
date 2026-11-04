<template>
  <!-- Flat, each tab is a section of the page under its title: a card in a card theme, a part of the stack in flat. -->
  <WSection
    v-if="flat"
    :title="title"
    tag="div"
  >
    <slot />
  </WSection>

  <div
    v-else-if="!removable || active"
    v-show="active"
    ref="element"
    class="h-full"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, onBeforeUnmount, onMounted, provide, ref, toRef, useTemplateRef, watch} from 'vue'

import WSection from '@/components/Surface/WSection.vue'

import {wListPageFrame} from '@/components/List/models/injection'
import {useUniformState} from '@/components/Uniform/utils/injection'

import {useTabItemActiveListener} from '../use/useTabItemActiveListener'

const props = defineProps<{
  name: string
  title: string | undefined
  active: boolean
  removable: boolean
  flat: boolean
}>()

const emit = defineEmits<{
  (e: 'update:height', value: number): void
  (e: 'update:active'): void
}>()

const {hasChanges, hasValue, hasError, validate} = useUniformState()

// In a page list frame (WTabs `section`) only the open tab's list joins it.
const frame = inject(wListPageFrame, null)

if (frame) provide(wListPageFrame, {...frame, shown: computed(() => props.active && frame.shown.value)})

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
  validate,
})
</script>