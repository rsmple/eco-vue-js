<template>
  <slot />
</template>

<script lang="ts" setup>
import type {ListPageFrame} from '../models/injection'
import type {InfiniteListHeaderScope} from '@/components/InfiniteList/types'

import {computed, provide} from 'vue'

import {wListPageFrame} from '../models/injection'

/** Gives the content of a page list frame the frame, with its stuck header's scope from the header wrapper's slot. */
const props = defineProps<InfiniteListHeaderScope & {
  frame: Omit<ListPageFrame, 'shown' | 'scope'>
}>()

provide(wListPageFrame, {
  ...props.frame,
  shown: computed(() => true),
  scope: props,
})

defineSlots<{
  default: () => void
}>()
</script>
