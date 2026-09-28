<template>
  <div ref="element">
    <slot />
  </div>
</template>

<script setup lang="ts">
import {computed, provide, useTemplateRef} from 'vue'

import {wScrollingElement} from './models/injection'

const props = defineProps<{
  /** Uses the parent element as the scroll container instead of this one. */
  parent?: boolean
}>()

defineSlots<{
  /** Content with infinite lists and sticky headers that scroll inside this element instead of the page. */
  default?: () => void
}>()

const elementRef = useTemplateRef('element')

const elementValue = computed(() => props.parent ? elementRef.value?.parentElement ?? null : elementRef.value)

provide(wScrollingElement, elementValue)
</script>