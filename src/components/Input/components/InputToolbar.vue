<template>
  <div
    class="
      bg-default dark:bg-default-dark no-scrollbar sticky top-0 z-[2] col-span-full -mb-2 flex
      overflow-x-auto overscroll-x-contain border-b border-solid border-gray-50 text-xs dark:border-gray-800/50
    "
    @mousedown.prevent=""
  >
    <slot />

    <WInputToolbarButton
      v-for="(action, index) in list"
      :key="index"
      v-bind="action"
      @click="wrapSelection(action, $event)"
    />

    <template v-if="rich">
      <WInputToolbarButton
        v-for="(action, index) in toolbarActionList"
        :key="index"
        v-bind="action"
        @click="wrapSelection(action, $event)"
      />
    </template>

    <template v-if="!textSecure">
      <WInputToolbarButton
        tooltip="Undo"
        :icon="markRaw(IconUndo)"
        :disabled="!isUndo"
        @click="$emit('undo')"
      />

      <WInputToolbarButton
        tooltip="Redo"
        :icon="markRaw(IconRedo)"
        :disabled="!isRedo"
        @click="$emit('redo')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type {ToolbarAction, WrapSelection} from '@/components/Input/types'

import {markRaw} from 'vue'

import IconRedo from '@/assets/icons/IconRedo.svg?component'
import IconUndo from '@/assets/icons/IconUndo.svg?component'

import WInputToolbarButton from '../WInputToolbarButton.vue'
import {toolbarActionList} from '../models/toolbarActions'

defineProps<{
  list: ToolbarAction[] | undefined
  rich: boolean
  isUndo: boolean
  isRedo: boolean
  textSecure: boolean
}>()

const emit = defineEmits<{
  (e: 'wrap-selection', value: WrapSelection): void
  (e: 'undo'): void
  (e: 'redo'): void
}>()

const wrapSelection = (action: ToolbarAction, index: number | undefined) => {
  const value = Array.isArray(action.value) && typeof index === 'number' ? action.value[index].value : action.value as WrapSelection
  if (value) emit('wrap-selection', value)
}
</script>