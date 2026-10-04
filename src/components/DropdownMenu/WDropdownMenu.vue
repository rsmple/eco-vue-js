<template>
  <component
    :is="unwrapSlots($slots.toggle?.({isTop, unclickable: undefined}) ?? [])[0]"
    ref="container"
    v-bind="$attrs"
  />

  <Teleport
    to="body"
    :disabled="!isOpen"
  >
    <WDropdown
      v-if="(parentElement || element) && isOpen"
      ref="dropdown"
      :parent-element="parentElement ?? (element as HTMLDivElement)"
      :horizontal-align="horizontalAlign"
      :update-align="updateAlign"
      :emit-update="emitUpdate"
      :style="{zIndex: baseZIndex + BASE_ZINDEX_DROPDOWN}"
      :top="top"
      :bottom="bottom"
      :inner-class="dropdownClass"
      @update:rect="$emit('update:rect')"
    >
      <template #default="defaultScope">
        <slot
          name="content"
          v-bind="defaultScope"
        />
      </template>
    </WDropdown>
  </Teleport>
</template>

<script lang="ts" setup>
import type {DropdownMenuProps} from './types'
import type {DropdownDefaultSlotScope} from '@/components/Dropdown/types'

import {type VNode, computed, inject, useTemplateRef} from 'vue'

import WDropdown from '@/components/Dropdown/WDropdown.vue'

import {BASE_ZINDEX_DROPDOWN, getIsClientSide, unwrapSlots, wBaseZIndex} from '@/utils/utils'

defineProps<DropdownMenuProps>()

defineEmits<{
  /** The parent moved on scroll or resize, with `emitUpdate` set. */
  (e: 'update:rect'): void
}>()

const baseZIndex = inject(wBaseZIndex, 0)

const containerRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('container')
const dropdownRef = useTemplateRef<ComponentInstance<typeof WDropdown>>('dropdown')

const element = computed(() => getIsClientSide() ? containerRef.value instanceof HTMLElement ? containerRef.value : containerRef.value?.$el : undefined)

const isTop = computed(() => dropdownRef.value?.isTop ?? false)

defineSlots<{
  /** Element that opens the menu, and that it is positioned against. `isTop` is true while the menu is open above it. */
  toggle?: (props: {isTop: boolean, unclickable: undefined}) => VNode[]
  /** Menu content, rendered while open. `isTop`, `isLeft` and `isRight` tell where it opened relative to the parent, `atBottom` that it sits in the lower half of the viewport. */
  content?: (props: DropdownDefaultSlotScope) => VNode[]
}>()

defineExpose({
  updateDropdown: () => {
    dropdownRef.value?.update()
  },
})
</script>
