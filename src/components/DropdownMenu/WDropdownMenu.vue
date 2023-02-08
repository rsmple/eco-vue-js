<template>
  <div ref="container">
    <slot name="toggle" />

    <Transition
      enter-active-class="fade-enter-active"
      leave-active-class="fade-leave-active"
      enter-from-class="fade-enter-from"
      leave-to-class="fade-leave-to"
    >
      <WDropdown
        v-if="container && isOpen"
        ref="dropdown"
        :parent-element="container"
        :horizontal-align="horizontalAlign"
        :update-align="updateAlign"
        :max-height="maxHeight"
        :max-width="maxWidth"
      >
        <slot name="content" />
      </WDropdown>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import type {HorizontalAlign} from '@/utils/HorizontalAlign'

defineProps<{
  isOpen: boolean
  maxHeight: number
  maxWidth: number
  horizontalAlign: HorizontalAlign
  updateAlign: boolean
}>()

const container = ref<HTMLDivElement>()
const dropdown = ref<InstanceType<typeof WDropdown> | undefined>()

defineExpose({
  updateDropdown: () => {
    dropdown.value?.update()
  },
})

</script>
