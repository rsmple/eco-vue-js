<template>
  <component
    :is="isMobile ? WBottomSheet : WDropdownMenu"
    ref="dropdown"
    v-bind="isMobile ? {
      isOpen,
      onClose: () => $emit('close'),
    } : {
      isOpen,
      horizontalAlign,
      updateAlign,
      emitUpdate,
      top,
      bottom,
      parentElement,
      dropdownClass,
      'onUpdate:rect': () => $emit('update:rect'),
    }"
  >
    <template #toggle="toggleScope">
      <slot
        v-if="$slots.header && toggleScope?.unclickable === false"
        name="header"
      />

      <slot
        v-else
        name="toggle"
        v-bind="{...toggleScope, isMobile}"
      />
    </template>

    <template #content="contentScope">
      <WClickOutside
        v-if="closeOnClickOutside && !isMobile"
        @click="$emit('close')"
      >
        <slot
          name="content"
          v-bind="{...contentScope, isMobile}"
        />
      </WClickOutside>

      <slot
        v-else
        name="content"
        v-bind="{...contentScope, isMobile}"
      />
    </template>
  </component>
</template>

<script lang="ts" setup>
import type {DropdownAdaptiveProps} from './types'
import type {DropdownDefaultSlotScope} from '@/components/Dropdown/types'

import {type VNode, useTemplateRef} from 'vue'

import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import {useIsMobile} from '@/utils/mobile'

defineOptions({inheritAttrs: false})

defineProps<DropdownAdaptiveProps>()

defineEmits<{
  /** The bottom sheet was dismissed on mobile, or a click landed outside the menu with `closeOnClickOutside`. */
  (e: 'close'): void
  /** The parent moved on scroll or resize, with `emitUpdate` set. Desktop only. */
  (e: 'update:rect'): void
}>()

const dropdownRef = useTemplateRef('dropdown')
const {isMobile} = useIsMobile()

defineSlots<{
  /** Element that opens the menu. On mobile it is also repeated at the top of the bottom sheet — `unclickable` is true for the one on the page and false for the copy in the sheet. */
  toggle?: (props: {isTop?: boolean, unclickable?: boolean, isMobile: boolean}) => VNode[]
  /** Replaces the copy of `toggle` at the top of the bottom sheet on mobile. */
  header?: () => void
  /** Menu content, rendered in a dropdown on desktop and in a bottom sheet on mobile. The placement props of WDropdownMenu are passed on desktop only. */
  content?: (props: Partial<DropdownDefaultSlotScope> & {isMobile: boolean}) => VNode[]
}>()

defineExpose({
  updateDropdown: () => {
    if (dropdownRef.value && 'updateDropdown' in dropdownRef.value) dropdownRef.value.updateDropdown()
  },
})
</script>
