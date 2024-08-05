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
          v-if="container && isOpen"
          ref="dropdown"
          :parent-element="container"
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
import {ref} from 'vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import type {DropdownMenuProps} from './types'

defineProps<DropdownMenuProps>()

defineEmits<{
  (e: 'update:rect'): void
}>()

const container = ref<HTMLDivElement>()
const dropdown = ref<ComponentInstance<typeof WDropdown> | undefined>()

defineExpose({
  updateDropdown: () => {
    dropdown.value?.update()
  },
})

</script>
