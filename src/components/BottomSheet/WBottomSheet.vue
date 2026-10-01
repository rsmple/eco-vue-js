<template>
  <slot
    name="toggle"
    :unclickable="true"
  />

  <Teleport to="body">
    <WDismissable
      :is-open="isOpen"
      class="bg-primary-light/40 dark:bg-primary-darkest/40 fixed inset-0 backdrop-blur"
      content-class="bg-surface grid-cols-[1fr] grid-rows-[auto_1fr] height-[90%] rounded-t-3xl shadow-md relative grid"
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

      <div class="absolute top-full h-screen w-full bg-inherit" />
    </WDismissable>
  </Teleport>
</template>

<script lang="ts" setup>
import {inject} from 'vue'

import WDismissable from '@/components/Dismissable/WDismissable.vue'

import {BASE_ZINDEX_BOTTOM_SHEET, wBaseZIndex} from '@/utils/utils'

defineProps<{
  /** Opens the sheet. */
  isOpen: boolean
}>()

defineEmits<{
  /** The sheet was swiped down or the backdrop was clicked. Set `isOpen` to `false` on it. */
  (e: 'close'): void
}>()

defineSlots<{
  /** Element that opens the sheet, rendered in place and again at the top of the sheet — `unclickable` is `true` for the one in place and `false` for the copy. */
  toggle?: (props: {unclickable: boolean, isTop?: boolean}) => void
  /** Content of the sheet, which scrolls under the toggle. */
  content?: () => void
}>()

const baseZIndex = inject(wBaseZIndex, 0)
</script>
