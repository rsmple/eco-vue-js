<template>
  <component
    :is="$slots.toggle?.()?.[0]"
    ref="container"
    v-bind="$attrs"
  />

  <Teleport
    to="body"
    :disabled="!teleport || !isOpen"
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
      :class="{
        'z-[2]': !teleport && !noZIndex,
        'z-30': teleport && !noZIndex,
      }"
      :style="{zIndex}"
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

import {computed, useTemplateRef} from 'vue'

import WDropdown from '@/components/Dropdown/WDropdown.vue'

defineProps<DropdownMenuProps>()

defineEmits<{
  (e: 'update:rect'): void
}>()

const containerRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('container')
const dropdownRef = useTemplateRef('dropdown')

const element = computed(() => containerRef.value instanceof HTMLElement ? containerRef.value : containerRef.value?.$el)

defineExpose({
  updateDropdown: () => {
    dropdownRef.value?.update()
  },
})
</script>
