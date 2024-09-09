<template>
  <div class="flex text-description font-semibold">
    <template v-if="allowSelect">
      <div
        v-if="selection === undefined || count === 0"
        class="w-list-header-item width-16"
      />

      <WCheckbox
        v-else
        :disabled="disabled"
        :model-value="selection"
        :tooltip-text="tooltipText"
        intermediate
        class="w-list-header-item width-16 justify-end"
        @update:model-value="$emit('toggle:selection', $event)"
      />
    </template>

    <slot />

    <div
      v-if="!hideMore"
      class="w-list-header-item width-14"
    />
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