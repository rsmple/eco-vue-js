<template>
  <div
    v-if="!isMobile"
    ref="element"
    class="rounded-inherit pointer-events-none absolute inset-0 overflow-hidden print:hidden"
  >
    <div
      class="bg-default/80 dark:bg-default/50 pointer-events-none absolute h-full w-screen bg-clip-border" 
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

import {useIsMobile} from '@/utils/mobile'

import {useShine} from './use/useShine'

const {id} = useShine()
const {isMobile} = useIsMobile()

const elementRef = useTemplateRef('element')
</script>