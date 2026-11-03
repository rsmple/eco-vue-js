<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen && isTablet"
      title="Click to close"
      class="
        bg-backdrop no-scrollbar fixed left-0 top-0 size-full
        overflow-y-auto overflow-x-hidden overscroll-contain backdrop-blur print:hidden
      "
      :style="{zIndex: BASE_ZINDEX_NAV_BAR}"
      @click.stop.prevent="close"
    >
      <div class="h-[calc(100%+1px)]" />
    </div>
  </Transition>

  <nav
    class="
      w-nav-bar fixed left-(--w-left-margin,0px) top-0 flex h-full flex-col overflow-hidden
      transition-[clip-path] duration-200 [clip-path:inset(-2rem)] print:hidden
    "
    :class="[{
      'xl-not:[clip-path:inset(-2rem_calc(100%+2rem)_-2rem_-2rem)]': !isOpen,
    }, $attrs.class]"
    :style="{zIndex: BASE_ZINDEX_NAV_BAR}"
  >
    <WRouterLink
      v-if="$slots.brand && brandTo"
      :to="brandTo"
      class="w-nav-bar-brand w-ripple-trigger h---header-height flex shrink-0 no-underline"
    >
      <div class="w-ripple w-ripple-hover tone-primary text-tone relative flex items-center justify-center rounded-(--w-nav-item-rounded)">
        <slot name="brand" />
      </div>
    </WRouterLink>

    <div
      v-else-if="$slots.brand"
      class="w-nav-bar-brand h---header-height flex shrink-0"
    >
      <slot name="brand" />
    </div>

    <div class="w-nav-bar-content mt---header-height flex min-h-0 flex-auto flex-col overflow-hidden">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="w-nav-bar-footer w-nav-bar-width shrink-0"
    >
      <slot name="footer" />
    </div>
  </nav>

  <div
    class="w-nav-bar-toggle square---header-height w-ripple fixed left-(--w-left-margin,0px) top-0 flex cursor-pointer items-center justify-start xl:hidden print:hidden"
    :class="{'tone-primary text-tone': isOpen}"
    :style="{zIndex: BASE_ZINDEX_NAV_BAR}"
    @click.stop="toggle"
  >
    <IconMenu />
  </div>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {provide, ref} from 'vue'

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'

import IconMenu from '@/assets/icons/IconMenu.svg?component'

import {useIsMobile} from '@/utils/mobile'
import {BASE_ZINDEX_NAV_BAR, wBaseZIndex} from '@/utils/utils'

defineProps<{
  /** Where the brand links to, such as the home page. The whole brand row is the link, as an item is, with its hover pill inset as the items' and the brand mark centered in it. */
  brandTo?: LinkProps['to']
}>()

const emit = defineEmits<{
  /** The nav opened or closed below `xl`, where it is an overlay. */
  (e: 'update:is-open', value: boolean): void
}>()

defineSlots<{
  /** Content of the nav, such as WNavItem items. */
  default?: () => void
  /** A logo or brand mark in the frame's top-left corner: the nav's top row, level with the header. With `brandTo` the row is a link and the slot is the mark in its pill. Without it the row is inset as the items are and the slot fills it, so content with `rounded-(--w-nav-item-rounded)` lines up with them. Below `xl` it is a row of its own under the toggle. */
  brand?: () => void
  /**
   * Content at the nav's bottom, such as a back button or the app's version: under the items, which scroll above it,
   * past a line. It is inset as the items are and paints nothing of its own, so it is the nav's surface in every layout
   * style.
   */
  footer?: () => void
}>()

provide(wBaseZIndex, BASE_ZINDEX_NAV_BAR)

const {isTablet} = useIsMobile()

const isOpen = ref(false)

const emitIsOpen = () => {
  emit('update:is-open', isOpen.value)
}

const toggle = () => {
  isOpen.value = !isOpen.value

  emitIsOpen()
}

const close = () => {
  isOpen.value = false

  emitIsOpen()
}
</script>
