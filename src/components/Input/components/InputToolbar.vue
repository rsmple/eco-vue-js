<template>
  <div
    class="
      bg-default dark:bg-default-dark no-scrollbar sticky top-0 z-[2] col-span-full -mb-2 flex
      overflow-x-auto overscroll-x-contain border-b border-solid border-gray-50 text-xs dark:border-gray-800/50
    "
    @mousedown.prevent=""
  >
    <slot />

    <InputToolbarItem
      v-for="(action, index) in list"
      :key="index"
      :action="action"
      @wrap-selection="$emit('wrap-selection', $event)"
    />

    <template v-if="rich">
      <InputToolbarItem
        v-for="(action, index) in toolbarActionList"
        :key="index"
        :action="action"
        @wrap-selection="$emit('wrap-selection', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type {ToolbarAction, WrapSelection} from '@/components/Input/types'

import InputToolbarItem from './InputToolbarItem.vue'

import {toolbarActionList} from '../models/toolbarActions'

defineProps<{
  list: ToolbarAction[] | undefined
  rich: boolean
}>()

defineEmits<{
  (e: 'wrap-selection', value: WrapSelection): void
}>()
</script>