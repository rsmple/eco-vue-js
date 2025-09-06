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
      :class="dropdownClass"
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

import {BASE_ZINDEX_DROPDOWN, isClientSide, unwrapSlots, wBaseZIndex} from '@/utils/utils'

defineProps<DropdownMenuProps>()

defineEmits<{
  (e: 'update:rect'): void
}>()

const baseZIndex = inject(wBaseZIndex, 0)

const containerRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('container')
const dropdownRef = useTemplateRef<ComponentInstance<typeof WDropdown>>('dropdown')

const element = computed(() => isClientSide ? containerRef.value instanceof HTMLElement ? containerRef.value : containerRef.value?.$el : undefined)

const isTop = computed(() => dropdownRef.value?.top ?? false)

defineSlots<{
  toggle?: (props: {isTop: boolean, unclickable: undefined}) => VNode[]
  content?: (props: DropdownDefaultSlotScope) => VNode[]
}>()

defineExpose({
  updateDropdown: () => {
    dropdownRef.value?.update()
  },
})
</script>
