<template>
  <WDropdownMenu 
    :is-open="isOpen"
    :max-height="maxHeight"
    :max-width="maxWidth"
    :horizontal-align="horizontalAlign"
    update-align
    :teleport="teleport"
  >
    <template #toggle>
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

import {ref} from 'vue'

import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconArrow from '@/assets/icons/default/IconArrow.svg?component'

import {HorizontalAlign} from '@/main'

import WButton from './WButton.vue'

withDefaults(
  defineProps<ButtonDropdownProps>(),
  {
    maxHeight: 200,
    maxWidth: 320,
    horizontalAlign: HorizontalAlign.LEFT_INNER,
  },
)

const isOpen = ref(false)

const close = () => {
  isOpen.value = false
}
</script>