<template>
  <WDropdownMenu
    v-if="Array.isArray(action.value)"
    :is-open="isOpen"
    :horizontal-align="HorizontalAlign.CENTER"
  >
    <template #toggle>
      <InputToolbarButton
        :action="action"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #content>
      <WClickOutside
        class="
          bg-default dark:bg-default-dark overflow-hidden rounded-xl
          text-start text-xs font-normal shadow-md dark:border dark:border-solid dark:border-gray-800
        "
        @click="isOpen = false"
      >
        <WMenuItem
          v-for="(item, index) in action.value"
          :key="index"
          @click="$emit('wrap-selection', item.value)"
        >
          <component :is="item.icon" /> {{ item.title }}
        </WMenuItem>
      </WClickOutside>
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

import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

import InputToolbarButton from './InputToolbarButton.vue'

defineProps<{
  action: ToolbarAction
}>()

defineEmits<{
  (e: 'wrap-selection', value: WrapSelection): void
}>()

const isOpen = ref(false)
</script>