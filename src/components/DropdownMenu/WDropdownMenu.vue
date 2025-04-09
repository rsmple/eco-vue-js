<template>
  <component
    :is="unwrapSlots($slots.toggle?.() ?? [])[0]"
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
      :max-height="maxHeight"
      :max-width="maxWidth"
      :emit-update="emitUpdate"
      :style="{zIndex: baseZIndex + BASE_ZINDEX_DROPDOWN}"
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

import {BASE_ZINDEX_DROPDOWN, unwrapSlots, wBaseZIndex} from '@/utils/utils'

defineProps<DropdownMenuProps>()

defineEmits<{
  (e: 'update:rect'): void
}>()

const baseZIndex = inject(wBaseZIndex, 0)

const containerRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('container')
const dropdownRef = useTemplateRef('dropdown')

const element = computed(() => containerRef.value instanceof HTMLElement ? containerRef.value : containerRef.value?.$el)

defineSlots<{
  toggle?: () => VNode[]
  content?: (props: DropdownDefaultSlotScope) => VNode[]
}>()

defineExpose({
  updateDropdown: () => {
    dropdownRef.value?.update()
  },
})
</script>
