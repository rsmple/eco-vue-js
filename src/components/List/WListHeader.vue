<template>
  <div class="flex h-12">
    <div class="left-inner bg-default dark:bg-default-dark sticky z-[1]">
      <div class="bg-default dark:bg-default-dark absolute right-full top-0 z-[-1] h-full w-[calc(var(--nav-bar-width)+var(--inner-margin))]" />

      <div
        class="bg-primary-light dark:bg-primary-darkest h-full rounded-l-2xl border-y border-l border-solid border-gray-300 dark:border-gray-700"
        :class="{
          'width-16': allowSelect,
          'width-4': !allowSelect,
        }"
      >
        <WCheckbox
          v-if="allowSelect && selection !== undefined && count !== 0 && count !== undefined"
          :disabled="disabled"
          :model-value="selection"
          :tooltip-text="tooltipText"
          intermediate
          class="size-full justify-end pr-6"
          @update:model-value="$emit('toggle:selection', $event)"
        />
      </div>
    </div>

    <div class="bg-primary-light dark:bg-primary-darkest flex flex-1 border-y border-solid border-gray-300 dark:border-gray-700">
      <slot />
    </div>

    <div class="right-inner bg-default dark:bg-default-dark sticky z-[1]">
      <div class="bg-default dark:bg-default-dark absolute left-full top-0 z-[-1] h-full w-[calc(var(--actions-bar-width)+var(--inner-margin))]" />

      <div
        class="bg-primary-light dark:bg-primary-darkest h-full rounded-r-2xl border-y border-r border-solid border-gray-300 dark:border-gray-700"
        :class="{
          'width-14': !hideMore,
          'width-4': hideMore,
        }"
      >
        <slot name="settings" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import WCheckbox from '@/components/Checkbox/WCheckbox.vue'

defineProps<{
  allowSelect?: boolean
  hideMore?: boolean
  disabled?: boolean
  count?: number
  selection?: boolean | null
  tooltipText: string
}>()

defineEmits<{
  (e: 'toggle:selection', value: boolean): void
}>()
</script>