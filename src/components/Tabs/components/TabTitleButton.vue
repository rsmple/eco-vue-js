<template>
  <div
    ref="container"
    class="relative grid" 
    :class="{
      'col-span-2 grid grid-cols-subgrid': side,
      'grid-cols-[1fr,auto]': !side,
    }"
  >
    <WButtonTab
      :active="active"
      :disabled="disabled"
      :has-changes="hasChanges"
      :has-error="hasError"
      :has-value="hasValue"
      :indicator="stepper"
      :side="side"
      :title="title"
      :icon="icon"
      :status-icon="statusIcon"
      :show-has-value="showHasValue"
      @click="$emit('click', $event)"
    >
      <template v-if="$slots.title">
        <slot name="title" />
      </template>
    </WButtonTab>

    <slot
      name="right"
      v-bind="{hasChanges, hasError, hasValue}"
    />
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, useTemplateRef, watch} from 'vue'

import WButtonTab from '@/components/Button/WButtonTab.vue'

const props = defineProps<{
  active: boolean
  index: number
  hasError: boolean
  hasChanges: boolean
  hasValue: boolean
  title?: string
  icon: SVGComponent | undefined
  first: boolean
  last: boolean
  disabled?: boolean
  stepper?: boolean
  showHasValue?: boolean
  side?: boolean
  statusIcon?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', value: MouseEvent): void
  (e: 'update:scroll-position', value: {left: number} | {top: number}): void
}>()

const containerRef = useTemplateRef('container')

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