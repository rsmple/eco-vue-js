<template>
  <div
    class="group/overflow relative grid max-w-80 overflow-hidden"
    @mouseenter="updateOverflow"
  >
    <span class="pointer-events-none select-none overflow-hidden opacity-0"><slot /></span>
    <div
      ref="element"
      class="absolute inset-y-0 left-0"
      :class="{
        'delay-300 group-hover/overflow:translate-x-[--text-overflow,0px] group-hover/overflow:transition-transform group-hover/overflow:duration-[--text-overflow-duration,150ms] group-hover/overflow:ease-linear': overflow,
      }"
      :style="overflow ? {
        '--text-overflow': `-${overflow}px`,
        '--text-overflow-duration': `${overflow * 30}ms`,
      } : undefined"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

// Use group/overflow to trigger from outside elements hover

const overflow = ref(0)

const elementRef = useTemplateRef('element')

const updateOverflow = () => {
  if (!elementRef.value?.parentElement) return

  const width = elementRef.value.offsetWidth
  const parentWidth = elementRef.value.parentElement.offsetWidth

  if (width > parentWidth) overflow.value = Math.round(width - parentWidth)
  else overflow.value = 0
}

const findParent = (element: Element): Element | null => element.classList.contains('group/overflow') ? element : element.parentElement ? findParent(element.parentElement) : null

let parent: Element | null = null

onMounted(() => {
  updateOverflow()

  if (!elementRef.value?.parentElement?.parentElement) return

  parent = findParent(elementRef.value.parentElement.parentElement)

  if (parent) parent.addEventListener('mouseenter', updateOverflow)
})

onBeforeUnmount(() => {
  if (parent) parent.removeEventListener('mouseenter', updateOverflow)
})
</script>