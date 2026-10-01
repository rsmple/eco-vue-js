<template>
  <WDropdownMenu 
    :is-open="isOpen"
    :horizontal-align="horizontalAlign"
    update-align
  >
    <template #toggle>
      <div>
        <div class="flex">
          <WButton
            v-if="leftToggle"
            :semantic-type="semanticType"
            :disabled="disabled"
            join
            @click="isOpen = !isOpen"
          >
            <IconArrow
              class="square-4 transition-transform"
              :class="{'rotate-180': isOpen}"
            />
          </WButton>

          <component
            :is="item"
            v-for="(item, index) in $slots.button?.()"
            :key="index"
            join
            class="flex-1"
          />

          <WButton
            v-if="!leftToggle"
            :semantic-type="semanticType"
            :disabled="disabled"
            join
            @click="isOpen = !isOpen"
          >
            <IconArrow
              class="square-[1em] transition-transform"
              :class="{'rotate-180': isOpen}"
            />
          </WButton>
        </div>

        <WTooltip
          v-if="tooltipText"
          :text="tooltipText"
        />
      </div>
    </template>

    <template #content>
      <WClickOutside
        class="
          bg-surface my-1 max-h-[inherit] w-full overflow-y-auto
          overflow-x-hidden overscroll-contain rounded-xl shadow-md border border-solid border-line-raised
        "
        @click="close"
      >
        <slot
          name="content"
          :close="close"
        />
      </WClickOutside>
    </template>
  </WDropdownMenu>
</template>

<script lang="ts" setup>
import type {ButtonDropdownProps} from './types'

import {type VNode, ref} from 'vue'

import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

import WButton from './WButton.vue'

withDefaults(
  defineProps<ButtonDropdownProps>(),
  {
    horizontalAlign: HorizontalAlign.LEFT_INNER,
    disabled: undefined,
  },
)

const isOpen = ref(false)

const close = () => {
  isOpen.value = false
}

defineSlots<{
  /** Buttons joined to the arrow button. They keep their own click handlers. */
  button?: () => VNode[]
  /** Menu content, usually WButtonMoreItem. A click inside closes the menu, and so does `close`. */
  content?: (props: {close: typeof close}) => VNode[]
}>()
</script>