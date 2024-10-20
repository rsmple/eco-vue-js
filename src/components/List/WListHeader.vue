<template>
  <div class="flex text-description font-semibold h-12">
    <div class="sticky z-[1] left-inner bg-default dark:bg-default-dark">
      <div class="absolute top-0 -z-[1] right-full h-full w-[calc(var(--nav-bar-width)+var(--inner-margin))] bg-default dark:bg-default-dark" />

      <div
        class="bg-primary-light dark:bg-primary-darkest border-y border-solid border-gray-300 dark:border-gray-700 rounded-l-2xl border-l h-full"
        :class="{
          'width-16': allowSelect,
          'width-4': !allowSelect,
        }"
      >
        <WCheckbox
          v-if="allowSelect && selection !== undefined && count !== 0"
          :disabled="disabled"
          :model-value="selection"
          :tooltip-text="tooltipText"
          intermediate
          class="w-full h-full justify-end pr-6"
          @update:model-value="$emit('toggle:selection', $event)"
        />
      </div>
    </div>

    <div class="bg-primary-light dark:bg-primary-darkest border-y border-solid border-gray-300 dark:border-gray-700 flex flex-1">
      <slot />
    </div>

    <div class="sticky z-[1] right-inner bg-default dark:bg-default-dark">
      <div class="absolute top-0 -z-[1] left-full h-full w-[calc(var(--actions-bar-width)+var(--inner-margin))] bg-default dark:bg-default-dark" />

      <div
        class="bg-primary-light dark:bg-primary-darkest border-y border-solid border-gray-300 dark:border-gray-700 rounded-r-2xl border-r h-full"
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