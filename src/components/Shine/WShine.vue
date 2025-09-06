<template>
  <div
    ref="element"
    class="rounded-inherit sm-not:hidden w-shine pointer-events-none absolute inset-0 overflow-hidden print:hidden"
  >
    <div
      class="bg-primary-light/70 dark:bg-primary-light/50 pointer-events-none absolute h-full w-screen bg-clip-border" 
      :style="{
        'mask': `url(#${id})`,
        '-webkit-mask': `url(#${id})`,
        'left': `-${elementRef?.getBoundingClientRect().left ?? 0}px`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import {useTemplateRef} from 'vue'

import {useShine} from './use/useShine'

const {id} = useShine()

const elementRef = useTemplateRef('element')
</script>