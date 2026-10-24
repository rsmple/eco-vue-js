<template>
  <div
    class="grid h-(--w-list-header-height,2rem)"
    :style="{gridTemplateColumns: `var(--w-list-left,auto) ${ columns } var(--w-list-right,auto)`}"
  >
    <div class="left---left-inner bg-surface sticky z-1">
      <div class="bg-surface w---left-inner absolute right-full top-0 -z-1 h-full" />

      <div
        class="h-full rounded-l-(--w-list-header-rounded,0.75rem) border-y border-l border-solid border-line bg-(--w-list-header-bg,inherit)"
        :class="{
          'width-(--w-list-header-rounded,1rem)': !allowSelect,
        }"
      >
        <div
          v-if="selectOnly"
          class="mx-(--w-list-padding,1rem) w-[calc(var(--w-checkbox-size,1rem)*1.5)]"
        />
        <WCheckbox
          v-else-if="allowSelect && selection !== undefined"
          :disabled="disabled || count === 0 || count === undefined"
          :readonly="false"
          :model-value="selection"
          :tooltip-text="tooltipText"
          intermediate
          class="size-full px-(--w-list-padding,1rem)"
          @update:model-value="$emit('toggle:selection', $event)"
        />
      </div>
    </div>

    <div class="col-[2/-2] grid grid-cols-subgrid border-y border-solid border-line bg-(--w-list-header-bg,inherit)">
      <slot />
    </div>

    <div class="right---right-inner bg-surface sticky z-1">
      <div class="bg-surface w---right-inner absolute left-full top-0 -z-1 h-full" />

      <div
        class="h-full rounded-r-(--w-list-header-rounded,0.75rem) border-y border-r border-solid border-line bg-(--w-list-header-bg,inherit)"
        :class="{
          'width-[calc(var(--w-list-padding,1rem)*2+1.25em)]': !hideMore,
          'width-(--w-list-header-rounded,1rem)': hideMore,
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
  /** Track sizes of the columns between the checkbox and the end cap, as in `grid-template-columns`. The rows use the same tracks, so the cells line up with them. */
  columns: string
  /** Shows the select-all checkbox. */
  allowSelect?: boolean
  /** Keeps the checkbox column's space without the checkbox, for lists without select-all. */
  selectOnly?: boolean
  /** Narrows the end cap when the rows have no menu. */
  hideMore?: boolean
  /** Disables the checkbox. */
  disabled?: boolean
  /** Total number of items. The checkbox is disabled while it is 0 or unknown. */
  count?: number
  /** State of the select-all checkbox: `true` for all, `null` for some, `false` for none. */
  selection?: boolean | null
  /** Tooltip of the select-all checkbox. */
  tooltipText: string
}>()

const emit = defineEmits<{
  /** The select-all checkbox was toggled. */
  (e: 'toggle:selection', value: boolean): void
  /** The header was mounted or unmounted, for the sticky header to measure it. */
  (e: 'update:header'): void
}>()

defineSlots<{
  /** WListHeaderItem cells, one per column. */
  default?: () => void
  /** Content of the end cap, such as the column settings button. */
  settings?: () => void
}>()

onMounted(() => {
  emit('update:header')
})

onUnmounted(() => {
  emit('update:header')
})
</script>