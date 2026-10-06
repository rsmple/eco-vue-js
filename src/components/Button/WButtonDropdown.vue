<template>
  <div ref="toggle">
    <div class="flex">
      <WButton
        v-if="leftToggle"
        :semantic-type="semanticType"
        :disabled="disabled"
        join
        @click="toggle"
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
        @click="toggle"
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

<script lang="ts" setup>
import type {ButtonDropdownProps} from './types'

import {type VNode, markRaw, ref, useSlots, useTemplateRef} from 'vue'

import WTooltip from '@/components/Tooltip/WTooltip.vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {useOverlay} from '@/utils/Overlay'

import WButton from './WButton.vue'

const props = withDefaults(
  defineProps<ButtonDropdownProps>(),
  {
    horizontalAlign: HorizontalAlign.LEFT_INNER,
    disabled: undefined,
  },
)

defineSlots<{
  /** Buttons joined to the arrow button. They keep their own click handlers. */
  button?: () => VNode[]
  /** Menu content, usually WButtonMoreItem. A click inside closes the menu, and so does `close`. On phones it is a bottom sheet. */
  content?: (props: {close: typeof close}) => VNode[]
}>()

const slots = useSlots()

const toggleRef = useTemplateRef('toggle')

const overlay = useOverlay()

const isOpen = ref(false)

let closeMenu: (() => void) | null = null

const close = () => {
  closeMenu?.()
}

// The overlay host renders the menu, as a component so the slot keeps this component's context.
const renderContent = markRaw(() => slots.content?.({close}))

const open = () => {
  if (!toggleRef.value) return

  const value: (() => void) | null = overlay.open({
    present: 'dropdown',
    anchor: toggleRef.value,
    content: renderContent,
    dropdown: {
      align: props.horizontalAlign,
      closeOnClick: true,
    },
    onClose: () => {
      if (closeMenu !== value) return

      closeMenu = null
      isOpen.value = false
    },
  })

  closeMenu = value
  isOpen.value = value !== null
}

const toggle = () => {
  if (isOpen.value) close()
  else open()
}
</script>
