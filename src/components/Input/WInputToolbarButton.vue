<template>
  <WDropdownMenu
    v-if="Array.isArray(action.value)"
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.CENTER"
    top
  >
    <template #toggle>
      <InputToolbarButton
        :action="action"
        @mouseenter="enter"
        @mouseleave="leave"
      />
    </template>

    <template #content>
      <div
        class="
          bg-default dark:bg-default-dark max-h-80 overflow-y-auto overscroll-y-contain rounded-xl
          text-start text-xs font-semibold shadow-md dark:border dark:border-solid dark:border-gray-800
        "
        @mouseenter="enter"
        @mouseleave="leave"
        @mousedown.prevent=""
      >
        <WMenuItem
          v-for="(item, index) in action.value"
          :key="index"
          @click="$emit('wrap-selection', item.value)"
        >
          <component :is="item.icon" /> {{ item.title }}
        </WMenuItem>
      </div>
    </template>
  </WDropdownMenu>

  <InputToolbarButton
    v-else
    :action="action"
    @click="$emit('wrap-selection', action.value)"
  />
</template>

<script setup lang="ts">
import type {ToolbarAction, WrapSelection} from '@/components/Input/types'

import {ref} from 'vue'

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

import InputToolbarButton from './components/InputToolbarButton.vue'

defineProps<{
  action: ToolbarAction
}>()

defineEmits<{
  (e: 'wrap-selection', value: WrapSelection): void
}>()

const isOpen = ref(false)

let timeout: NodeJS.Timeout | null = null

const enter = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }

  isOpen.value = true
}

const leave = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }

  timeout = setTimeout(() => {
    isOpen.value = false
    timeout = null
  })
}
</script>