<template>
  <button
    v-bind="$attrs"
    ref="button"
    :disabled="disabled"
    :class="{
      'w-hover-circle-trigger cursor-pointer': !disabled,
      'cursor-not-allowed opacity-50': disabled,
    }"
    class="flex justify-center outline-none"
    :aria-expanded="isOpen"
    :aria-disabled="disabled"
    aria-label="More options"
    @click="toggle"
  >
    <div
      class="relative"
      :class="{
        'w-hover-circle': !disabled,
        'text-description': !isOpen || isCustomAnchor,
        'tone-primary text-tone': isOpen && !isCustomAnchor,
      }"
    >
      <component
        :is="icon ?? IconMore"
        class="square-[1.125em]"
      />
    </div>
  </button>
</template>

<script lang="ts" setup>
import {markRaw, ref, useSlots, useTemplateRef} from 'vue'

import IconMore from '@/assets/icons/IconMore.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {type OverlayAnchor, useOverlay, useOwnerActive} from '@/utils/Overlay'

const props = defineProps<{
  /** Icon of the button. Defaults to three dots. */
  icon?: SVGComponent
  /** Blocks opening and dims the button. */
  disabled?: boolean
  /** Element the menu is positioned against instead of the button, aligned to its right edge — for a menu opened at a cursor or row. */
  anchor?: OverlayAnchor
}>()

const emit = defineEmits<{
  /** The menu closed — by a click on the button or inside the menu, or by something opened from it taking its place. */
  (e: 'close'): void
}>()

defineSlots<{
  /**
   * Menu items, usually WButtonMoreItem. A click inside closes the menu. Only one menu is open at a time, and on phones it is a bottom sheet.
   * A confirm opened from an item with `useOverlay` takes the menu's place at the same anchor.
   */
  default?: () => void
}>()

const slots = useSlots()

// The overlay host renders the menu, as a component so the slot keeps this component's context.
const renderSlot = markRaw(() => slots.default?.())

const buttonRef = useTemplateRef('button')

const overlay = useOverlay()

// Marks the menu and whatever it hands off to, such as a confirm, so a row can stay highlighted while either is open.
const owner = Symbol('WButtonMore')

let closeMenu: (() => void) | null = null

const isOpen = ref(false)
const isCustomAnchor = ref(false)

const isActive = useOwnerActive(owner)

/** Opens the menu at `anchor` — such as a point made with `createPointAnchor` — instead of the `anchor` prop or the button. */
const open = (anchor?: OverlayAnchor): void => {
  const target = anchor ?? props.anchor

  if (!target && !buttonRef.value) return

  const value: (() => void) | null = overlay.open({
    present: 'dropdown',
    owner,
    anchor: target ?? buttonRef.value!,
    content: renderSlot,
    dropdown: {
      align: target ? HorizontalAlign.RIGHT_INNER : HorizontalAlign.LEFT_INNER,
      cornered: target !== undefined,
      closeOnClick: true,
    },
    onClose: () => {
      if (closeMenu !== value) return

      closeMenu = null
      isOpen.value = false

      emit('close')
    },
  })

  closeMenu = value
  isOpen.value = value !== null
  isCustomAnchor.value = target !== undefined
}

const close = (): void => {
  closeMenu?.()
}

const toggle = (): void => {
  if (props.disabled) return

  if (isOpen.value) close()
  else open()
}

defineExpose({
  open,
  close,
  isOpen,
  /** The menu, or a confirm it handed off to, is open. */
  isActive,
})
</script>
