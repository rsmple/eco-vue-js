<template>
  <WBottomSheet
    v-if="isMobile"
    ref="sheet"
    is-open
    compact
    no-overlay
    @close="dismiss"
  >
    <template
      v-if="headers.length"
      #toggle="{unclickable}"
    >
      <template v-if="!unclickable">
        <component
          :is="render"
          v-for="(render, index) in headers"
          :key="index"
        />
      </template>
    </template>

    <template #content>
      <!-- Clicks inside the sheet stop at its content, so `closeOnClick` closes it here. It is the sheet's scroll container, which infinite lists inside follow. -->
      <WInfiniteListScrollingElement parent>
        <div
          class="pb-4 text-start font-normal"
          :class="{'pointer-events-none': closing}"
          @click="closeOnClick && dismiss()"
        >
          <slot />
        </div>
      </WInfiniteListScrollingElement>
    </template>
  </WBottomSheet>

  <Teleport
    v-else-if="!closing"
    to="body"
  >
    <!-- The layer's element, where a click counts as inside the dropdown it was opened from too. -->
    <div
      v-bind="{[LAYER_ATTRIBUTE]: layer ?? undefined}"
      class="contents"
    >
      <WDropdown
        ref="dropdown"
        :parent-element="anchor"
        :horizontal-align="cornered ? HorizontalAlign.RIGHT_INNER : align ?? HorizontalAlign.CENTER"
        :update-align="!cornered"
        :freeze="detached"
        :inner-class="hasTip ? isBeside ? 'w-max tone-surface-raised flex items-center' : 'w-max tone-surface-raised flex flex-col items-center' : undefined"
        :style="{zIndex}"
      >
        <template #default="{isTop, isLeft, isRight}">
          <!--
            Centered on the anchor with the tip pointing at it, under or over it — or beside it with `LEFT_CENTER` and `RIGHT_CENTER`.
            Near the edge of the screen only the box shifts, like a tooltip's, so the tip stays on the anchor.
          -->
          <WDropdownTip
            v-if="hasTip"
            :top="!isBeside && isTop"
            :left="isBeside && isLeft"
            :right="isBeside && isRight"
          />

          <!--
            Aligned to the anchor, such as a field's menu, it sizes to the space left on screen for the content to scroll in.
            At a point, such as where a row was right-clicked, the corner at the point is squared off instead of a tip.
          -->
          <WClickOutside
            :no-filter="closeOnClick"
            :class="[
              frameClass ?? 'w-dropdown-frame',
              hasTip ? isBeside ? 'w-tooltip-center-y' : 'w-tooltip-center-x' : undefined,
              cornered && frameClass === undefined && {
                'rounded-bl-none': isRight && isTop,
                'rounded-tl-none': isRight && !isTop,
                'rounded-br-none': isLeft && isTop,
                'rounded-tr-none': isLeft && !isTop,
              },
            ]"
            class="grid grid-rows-[auto_1fr]"
            @click="dismissOutside"
          >
            <!-- The content's pinned header, such as the field of an embedded select. It is inset like the sheet's, so the content brings no padding of its own. -->
            <div
              v-if="headers.length"
              class="px-3 pb-4 pt-3"
            >
              <component
                :is="render"
                v-for="(render, index) in headers"
                :key="index"
              />
            </div>

            <!-- The dropdown sizes to the space left on screen, and the content scrolls here. Infinite lists inside follow it. -->
            <WInfiniteListScrollingElement class="min-h-0 overflow-auto overscroll-contain">
              <slot />
            </WInfiniteListScrollingElement>
          </WClickOutside>
        </template>
      </WDropdown>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import type {OverlayAnchor, OverlayDropdownOptions} from '@/utils/Overlay'

import {type Component, computed, inject, provide, shallowRef, useTemplateRef, watch} from 'vue'

import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import WDropdownTip from '@/components/Dropdown/WDropdownTip.vue'
import WInfiniteListScrollingElement from '@/components/InfiniteList/WInfiniteListScrollingElement.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {getIsMobile} from '@/utils/mobile'
import {BASE_ZINDEX_DROPDOWN, wBaseZIndex} from '@/utils/utils'

import {LAYER_ATTRIBUTE, isInLayerWithin, wOverlayFrame, wOverlayHeader, wOverlayLayer} from '../models/overlayRegistry'

// Frame of a `dropdown` layer — a dropdown at the anchor, or a bottom sheet on phones.
const props = withDefaults(
  defineProps<OverlayDropdownOptions & {
    anchor: OverlayAnchor
    /** The layer is closed; the sheet slides down, then `closed` is emitted. */
    closing?: boolean
    /** The anchor left the page, which closes a dropdown; a sheet stays. */
    detached?: boolean
    /** The content is busy, such as a confirm running its action, and stays open until it is done. */
    busy?: boolean
  }>(),
  {
    align: undefined,
    frameClass: undefined,
    onTop: undefined,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'closed'): void
}>()

const sheetRef = useTemplateRef('sheet')

// Read once, so the frame does not change while open.
const isMobile = getIsMobile()

provide(wOverlayFrame, isMobile ? 'sheet' : 'dropdown')

// Pinned at the top of the sheet or the dropdown, above the content that scrolls, such as the sheet's title.
const headers = shallowRef<Component[]>([])

provide(wOverlayHeader, {
  add: render => headers.value = [...headers.value, render],
  remove: render => headers.value = headers.value.filter(item => item !== render),
})

const dropdownRef = useTemplateRef('dropdown')

if (props.onTop && !isMobile) watch(() => dropdownRef.value?.isTop ?? false, props.onTop, {immediate: true})

const isBeside = computed(() => props.align === HorizontalAlign.LEFT_CENTER || props.align === HorizontalAlign.RIGHT_CENTER)

const hasTip = computed(() => (props.align === undefined || isBeside.value) && !props.cornered)

const zIndex = inject(wBaseZIndex, 0) + BASE_ZINDEX_DROPDOWN

// Closing without the content's say — a click outside, a swipe, or a detached anchor — waits while the content is busy.
const dismiss = () => {
  if (props.busy || props.closing) return

  emit('close')
}

const layer = inject(wOverlayLayer, () => null)()

// A click on the anchor is its own — a field keeps its menu, a toggle closes it itself — and one in a dropdown opened from this one, such as a select's menu, is inside.
const dismissOutside = (event: Event) => {
  const path = event.composedPath()

  if (props.anchor instanceof Element && path.includes(props.anchor)) return
  if (layer !== null && isInLayerWithin(path, layer)) return

  dismiss()
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
