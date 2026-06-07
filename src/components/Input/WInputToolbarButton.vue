<template>
  <WDropdownMenu
    v-if="Array.isArray(value)"
    :is-open="!disabled && isOpen"
    :horizontal-align="HorizontalAlign.CENTER"
    top
  >
    <template #toggle>
      <InputToolbarButton
        :title="title"
        :icon="icon"
        :tooltip="tooltip"
        :disabled="disabled"
        :active="isOpen"
        :label="label"
        @mouseenter="enter"
        @mouseleave="leave"
      />
    </template>

    <template #content>
      <div
        class="
          bg-default dark:bg-default-dark flex overflow-y-auto overscroll-y-contain rounded-md
          text-xs shadow-md dark:border dark:border-solid dark:border-gray-800
        "
        @mouseenter="enter"
        @mouseleave="leave"
        @mousedown.prevent=""
      >
        <InputToolbarButton
          v-for="(item, index) in value"
          :key="index"
          :icon="item.icon"
          :title="item.title"
          :disabled="disabled"
          :tooltip="undefined"
          :label="item.label"
          @click="$emit('click', index)"
        />
      </div>
    </template>
  </WDropdownMenu>

  <InputToolbarButton
    v-else
    :title="title"
    :icon="icon"
    :tooltip="tooltip"
    :disabled="disabled"
    :label="label"
    @click="$emit('click', undefined)"
  />
</template>

<script setup lang="ts">
import type {ToolbarAction} from './types'

import {ref} from 'vue'

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

import InputToolbarButton from './components/InputToolbarButton.vue'

defineProps<ToolbarAction>()

defineEmits<{
  (e: 'click', index: number | undefined): void
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
  }, 500)
}
</script>