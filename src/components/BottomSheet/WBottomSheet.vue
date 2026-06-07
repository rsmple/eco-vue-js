<template>
  <slot
    name="toggle"
    :unclickable="true"
  />

  <Teleport to="body">
    <WDismissable
      :is-open="isOpen"
      class="bg-primary-light/40 dark:bg-primary-darkest/40 fixed inset-0 backdrop-blur"
      content-class="bg-default dark:bg-default-dark grid-cols-[1fr] grid-rows-[auto,1fr] height-[90%] rounded-t-3xl shadow-md relative grid"
      :style="{zIndex: baseZIndex + BASE_ZINDEX_BOTTOM_SHEET}"
      @close="$emit('close')"
    >
      <div class="px-3">
        <div class="flex h-9 items-center justify-center">
          <div class="h-1 w-12 rounded-sm bg-gray-300" />
        </div>

        <div>
          <slot
            name="toggle"
            :unclickable="false"
            v-bind="{isTop: false}"
          />
        </div>
      </div>

      <div class="overflow-y-auto overflow-x-hidden overscroll-contain">
        <slot name="content" />
      </div>

      <div class="absolute top-full h-screen w-full bg-[inherit]" />
    </WDismissable>
  </Teleport>
</template>

<script lang="ts" setup>
import {inject} from 'vue'

import WDismissable from '@/components/Dismissable/WDismissable.vue'

import {BASE_ZINDEX_BOTTOM_SHEET, wBaseZIndex} from '@/utils/utils'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const baseZIndex = inject(wBaseZIndex, 0)
</script>
