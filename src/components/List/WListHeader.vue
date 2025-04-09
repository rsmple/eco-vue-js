<template>
  <div class="flex h-[--w-list-header-height,2rem]">
    <div class="-left--left-inner bg-default dark:bg-default-dark sticky z-[1]">
      <div class="bg-default dark:bg-default-dark -w--left-inner absolute right-full top-0 z-[-1] h-full" />

      <div
        class="bg-primary-light dark:bg-primary-darkest h-full rounded-l-[--w-list-header-rounded,1rem] border-y border-l border-solid border-gray-300 dark:border-gray-700"
        :class="{
          'width-[--w-list-header-rounded,1rem]': !allowSelect,
        }"
      >
        <WCheckbox
          v-if="allowSelect && selection !== undefined"
          :disabled="disabled || count === 0 || count === undefined"
          :model-value="selection"
          :tooltip-text="tooltipText"
          intermediate
          class="size-full px-[--w-list-padding,1rem]"
          @update:model-value="$emit('toggle:selection', $event)"
        />
      </div>
    </div>

    <div class="bg-primary-light dark:bg-primary-darkest flex flex-1 border-y border-solid border-gray-300 dark:border-gray-700">
      <slot />
    </div>

    <div class="-right--right-inner bg-default dark:bg-default-dark sticky z-[1]">
      <div class="bg-default dark:bg-default-dark -w--right-inner absolute left-full top-0 z-[-1] h-full" />

      <div
        class="bg-primary-light dark:bg-primary-darkest h-full rounded-r-[--w-list-header-rounded,0.75rem] border-y border-r border-solid border-gray-300 dark:border-gray-700"
        :class="{
          'width-[calc(var(--w-list-padding,1rem)*2+1.25em)]': !hideMore,
          'width-[--w-list-header-rounded,1rem]': hideMore,
        }"
      >
        <slot name="settings" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted} from 'vue'

import WCheckbox from '@/components/Checkbox/WCheckbox.vue'

defineProps<{
  allowSelect?: boolean
  hideMore?: boolean
  disabled?: boolean
  count?: number
  selection?: boolean | null
  tooltipText: string
}>()

const emit = defineEmits<{
  (e: 'toggle:selection', value: boolean): void
  (e: 'update:header'): void
}>()

onMounted(() => {
  emit('update:header')
})

onUnmounted(() => {
  emit('update:header')
})
</script>