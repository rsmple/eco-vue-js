<template>
  <WBottomSheet
    v-if="isMobile"
    ref="sheet"
    is-open
    compact
    no-overlay
    @close="dismiss"
  >
    <template #content>
      <!-- Clicks inside the sheet stop at its content, so `closeOnClick` closes it here. -->
      <div
        class="pb-4 text-start font-normal"
        :class="[sheetClass, {'pointer-events-none': closing}]"
        @click="closeOnClick && dismiss()"
      >
        <slot />
      </div>
    </template>
  </WBottomSheet>

  <Teleport
    v-else-if="!closing"
    to="body"
  >
    <WDropdown
      :parent-element="anchor"
      :horizontal-align="cornered ? HorizontalAlign.RIGHT_INNER : HorizontalAlign.CENTER"
      :update-align="!cornered"
      :freeze="detached"
      :style="{zIndex}"
    >
      <template #default="{isTop, isLeft, isRight}">
        <!-- Centered on the anchor with the tip pointing at it. Near the edge of the screen only the box shifts, like a tooltip's, so the tip stays on the anchor. -->
        <div
          v-if="!cornered"
          class="tone-surface-raised flex flex-col items-center"
        >
          <WDropdownTip :top="isTop" />

          <WClickOutside
            :no-filter="closeOnClick"
            class="w-tooltip-center-x max-w-[calc(100vw-1.5rem)]"
            :class="frameClass ?? FRAME_CLASS"
            @click="dismiss"
          >
            <slot />
          </WClickOutside>
        </div>

        <!-- At a point, such as where a row was right-clicked, the corner at the point is squared off instead of a tip. -->
        <WClickOutside
          v-else
          :no-filter="closeOnClick"
          :class="frameClass ?? [
            FRAME_CLASS,
            {
              'rounded-bl-none': isRight && isTop,
              'rounded-tl-none': isRight && !isTop,
              'rounded-br-none': isLeft && isTop,
              'rounded-tr-none': isLeft && !isTop,
            },
          ]"
          @click="dismiss"
        >
          <slot />
        </WClickOutside>
      </template>
    </WDropdown>
  </Teleport>
</template>

<script lang="ts" setup>
import type {OverlayAnchor} from '@/utils/Overlay'

import {inject, provide, useTemplateRef, watch} from 'vue'

import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import WDropdownTip from '@/components/Dropdown/WDropdownTip.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {getIsMobile} from '@/utils/mobile'
import {BASE_ZINDEX_DROPDOWN, wBaseZIndex} from '@/utils/utils'

import {wOverlayFrame} from '../models/overlayRegistry'

// Frame of a `dropdown` layer — a dropdown at the anchor, or a bottom sheet on phones. Options match OverlayDropdownOptions.
const props = withDefaults(
  defineProps<{
    anchor: OverlayAnchor
    cornered?: boolean
    frameClass?: string
    sheetClass?: string
    closeOnClick?: boolean
    /** The layer is closed; the sheet slides down, then `closed` is emitted. */
    closing?: boolean
    /** The anchor left the page, which closes a dropdown; a sheet stays. */
    detached?: boolean
    /** The content is busy, such as a confirm running its action, and stays open until it is done. */
    busy?: boolean
  }>(),
  {
    frameClass: undefined,
    sheetClass: undefined,
  },
)

const FRAME_CLASS = 'surface-raised overflow-hidden rounded-xl text-start font-normal shadow-md border border-solid border-line-raised'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'closed'): void
}>()

const sheetRef = useTemplateRef('sheet')

// Read once, so the frame does not change while open.
const isMobile = getIsMobile()

provide(wOverlayFrame, isMobile ? 'sheet' : 'dropdown')

const zIndex = inject(wBaseZIndex, 0) + BASE_ZINDEX_DROPDOWN

// Closing without the content's say — a click outside, a swipe, or a detached anchor — waits while the content is busy.
const dismiss = () => {
  if (props.busy || props.closing) return

  emit('close')
}

// A dropdown has nothing left to stick to, so it is dismissed — staying in place until the content is done, if busy.
// A sheet does not need its anchor, so it stays.
watch(() => !isMobile && props.detached && !props.busy, value => {
  if (value) dismiss()
}, {immediate: true})

watch(() => props.closing, value => {
  if (!value) return

  if (sheetRef.value) sheetRef.value.hide().then(() => emit('closed'))
  else emit('closed')
})
</script>
