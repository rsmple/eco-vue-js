<template>
  <div ref="container">
    <slot
      name="toggle"
      :unclickable="false"
    />

    <Teleport
      to="body"
      :disabled="!teleport || !isOpen"
    >
      <WDropdown
        v-if="containerRef && isOpen"
        ref="dropdown"
        :parent-element="parentElement ?? (containerRef as HTMLDivElement)"
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
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import type {DropdownMenuProps} from './types'

import {useTemplateRef} from 'vue'

import WDropdown from '@/components/Dropdown/WDropdown.vue'

defineProps<DropdownMenuProps>()

defineEmits<{
  (e: 'update:rect'): void
}>()

const containerRef = useTemplateRef('container')
const dropdownRef = useTemplateRef('dropdown')

defineExpose({
  updateDropdown: () => {
    dropdownRef.value?.update()
  },
})
</script>
