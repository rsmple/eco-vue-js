<template>
  <WDropdownMenu 
    :is-open="isOpen"
    :max-height="maxHeight"
    :max-width="maxWidth"
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
              class="square-4 transition-transform"
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
          bg-default dark:bg-default-dark overflow-y-overlay my-1 max-h-[inherit] w-full
          overflow-x-hidden overscroll-contain rounded-xl shadow-md dark:border dark:border-solid dark:border-gray-800
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
    maxHeight: 200,
    maxWidth: 320,
    horizontalAlign: HorizontalAlign.LEFT_INNER,
    disabled: undefined,
  },
)

const isOpen = ref(false)

const close = () => {
  isOpen.value = false
}

defineSlots<{
  button?: () => VNode[]
  content?: (props: {close: typeof close}) => VNode[]
}>()
</script>