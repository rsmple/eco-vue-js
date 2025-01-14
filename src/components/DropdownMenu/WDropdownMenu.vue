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
      <Transition
        enter-active-class="transition-opacity"
        leave-active-class="transition-opacity"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <WDropdown
          v-if="containerRef && isOpen"
          ref="dropdown"
          :parent-element="(containerRef as HTMLDivElement)"
          :horizontal-align="horizontalAlign"
          :update-align="updateAlign"
          :max-height="maxHeight"
          :max-width="maxWidth"
          :emit-update="emitUpdate"
          :class="{
            'z-[2]': !teleport && !noZIndex,
            'z-30': teleport && !noZIndex,
          }"
          class="will-change-[top,bottom]"
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
      </Transition>
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
