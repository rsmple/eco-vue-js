<template>
  <div ref="element">
    <slot />
  </div>
</template>

<script setup lang="ts">
import {computed, provide, useTemplateRef} from 'vue'

import {wScrollingElement} from './models/injection'

const props = defineProps<{
  parent?: boolean
}>()

const elementRef = useTemplateRef('element')

const elementValue = computed(() => props.parent ? elementRef.value?.parentElement ?? null : elementRef.value)

provide(wScrollingElement, elementValue)
</script>