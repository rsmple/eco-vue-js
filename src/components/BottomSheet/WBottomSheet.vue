<template>
  <slot
    name="toggle"
    :unclickable="true"
  />

  <Teleport to="body">
    <DismissContainer
      :is-open="isOpen"
      class="bg-primary-light/40 dark:bg-primary-darkest/40 fixed inset-0"
      content-class="bg-default dark:bg-default-dark grid-cols-[1fr] grid-rows-[auto,1fr] height-[90%] rounded-t-3xl shadow-md relative grid"
      :style="{zIndex: baseZIndex + BASE_ZINDEX_BOTTOM_SHEET}"
      @close="$emit('close')"
    >
      <div class="px-3">
        <div class="flex h-9 items-center justify-center">
          <div class="h-1 w-12 rounded-sm bg-gray-300" />
        </div>

        <slot
          name="toggle"
          :unclickable="false"
        />
      </div>

      <div class="overflow-y-auto overflow-x-hidden overscroll-contain">
        <slot name="content" />
      </div>

      <div class="absolute top-full h-screen w-full bg-[inherit]" />
    </DismissContainer>
  </Teleport>
</template>

<script lang="ts" setup>
import {inject} from 'vue'

import {BASE_ZINDEX_BOTTOM_SHEET, wBaseZIndex} from '@/utils/utils'

import DismissContainer from './components/DismissContainer.vue'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const baseZIndex = inject(wBaseZIndex, 0)
</script>
