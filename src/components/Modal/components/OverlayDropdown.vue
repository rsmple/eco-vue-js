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
      v-if="hasTop"
      #toggle="{unclickable}"
    >
      <!-- The sheet insets its top by the frame's padding on its own. -->
      <template v-if="!unclickable">
        <h2
          v-if="regions.title.length"
          :id="titleId"
          class="text-accent pb-2 text-center text-lg font-semibold text-balance"
        >
          <OverlayRegion :parts="regions.title" />
        </h2>

        <div
          v-if="regions.subtitle.length"
          class="w-frame-bleed [--w-frame-padding:--spacing(3)]"
        >
          <OverlayRegion :parts="regions.subtitle" />
        </div>

        <div
          v-if="regions.header.length"
          class="pb-4"
        >
          <OverlayRegion :parts="regions.header" />
        </div>
      </template>
    </template>

    <template #content>
      <!-- Clicks inside the sheet stop at its content, so `closeOnClick` closes it here. It is the sheet's scroll container, which infinite lists inside follow. -->
      <WInfiniteListScrollingElement parent>
        <div
          class="text-start font-normal [--w-frame-padding:--spacing(3)]"
          :class="[{'pointer-events-none': closing, 'pb-4': !regions.actions.length}, options?.padded ? 'px-(--w-frame-padding)' : '[--w-frame-padding:0px]']"
          @click="closeOnClick && dismiss()"
        >
          <slot />
        </div>
      </WInfiniteListScrollingElement>
    </template>

    <template
      v-if="regions.actions.length"
      #footer
    >
      <div class="gap---inner-margin flex flex-col p-(--w-frame-padding) pb-4 [--w-frame-padding:--spacing(3)]">
        <OverlayRegion :parts="regions.actions" />
      </div>
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
            Near the edge of the screen only the box shifts, like a tooltip's, so the tip stays on the anchor. When the box is cut to the screen, the tip keeps its size.
          -->
          <WDropdownTip
            v-if="hasTip"
            class="shrink-0"
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
              // Content with a title is a dialog, such as a small form: it keeps to a width and a height, and what is in it scrolls between its title and buttons.
              // A list of options, such as a filter's, sizes to its content up to that width. Fields have no width of their own, so a form of fields, such as a text filter, keeps to the smallest width.
              regions.title.length ? [options?.fitContent ? 'w-max min-w-[min(18rem,calc(100vw-2rem))] max-w-[min(24rem,calc(100vw-2rem))]' : 'w-[min(24rem,calc(100vw-2rem))]', 'max-h-112'] : undefined,
              hasTip ? isBeside ? 'w-tooltip-center-y' : 'w-tooltip-center-x' : undefined,
              cornered && frameClass === undefined && {
                'rounded-bl-none': isRight && isTop,
                'rounded-tl-none': isRight && !isTop,
                'rounded-br-none': isLeft && isTop,
                'rounded-tr-none': isLeft && !isTop,
              },
            ]"
            class="flex min-h-0 flex-col [--w-frame-padding:--spacing(4)]"
            :role="regions.title.length ? 'dialog' : undefined"
            :aria-labelledby="regions.title.length ? titleId : undefined"
            @click="dismissOutside"
          >
            <!-- The content's title, such as a form's. It wraps to the width of the content rather than widening the dropdown. -->
            <h2
              v-if="regions.title.length"
              :id="titleId"
              class="text-accent contain-inline-size px-(--w-frame-padding) pt-(--w-frame-padding) pb-2 text-base font-semibold"
            >
              <OverlayRegion :parts="regions.title" />
            </h2>

            <div
              v-if="regions.subtitle.length"
              class="contain-inline-size pb-2"
            >
              <OverlayRegion :parts="regions.subtitle" />
            </div>

            <!-- The content's pinned header, such as the field of an embedded select. It is inset like the sheet's, so the content brings no padding of its own. -->
            <div
              v-if="regions.header.length"
              class="px-(--w-frame-padding) pb-4"
              :class="{'pt-(--w-frame-padding)': !regions.title.length && !regions.subtitle.length}"
            >
              <OverlayRegion :parts="regions.header" />
            </div>

            <!-- The dropdown sizes to the space left on screen, and the content scrolls here. Infinite lists inside follow it. Content with `flex-1` fills it, such as an empty state centered in a frame with a min height. -->
            <WInfiniteListScrollingElement
              class="flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain"
              :class="options?.padded ? ['px-(--w-frame-padding)', {'pt-(--w-frame-padding)': !hasTop, 'pb-(--w-frame-padding)': !regions.actions.length}] : '[--w-frame-padding:0px]'"
            >
              <slot />
            </WInfiniteListScrollingElement>

            <!-- The content's buttons, pinned under what scrolls. -->
            <div
              v-if="regions.actions.length"
              class="contain-inline-size flex gap-2 p-(--w-frame-padding)"
              :class="{'flex-col': options?.actionsCol}"
            >
              <OverlayRegion :parts="regions.actions" />
            </div>
          </WClickOutside>
        </template>
      </WDropdown>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import type {OverlayAnchor, OverlayDropdownOptions} from '@/utils/Overlay'

import {computed, inject, provide, useId, useTemplateRef, watch} from 'vue'

import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import WClickOutside from '@/components/ClickOutside/WClickOutside.vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import WDropdownTip from '@/components/Dropdown/WDropdownTip.vue'
import WInfiniteListScrollingElement from '@/components/InfiniteList/WInfiniteListScrollingElement.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {getIsMobile} from '@/utils/mobile'
import {BASE_ZINDEX_DROPDOWN, wBaseZIndex} from '@/utils/utils'

import OverlayRegion from './OverlayRegion.vue'

import {LAYER_ATTRIBUTE, isInLayerWithin, wOverlayFrame, wOverlayLayer} from '../models/overlayRegistry'
import {useOverlayRegions} from '../use/useOverlayRegions'

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

// Parts the content hands over: the title and the pinned header above what scrolls, and the buttons under it.
const {regions, options} = useOverlayRegions(['title', 'subtitle', 'header', 'actions'])

const hasTop = computed(() => regions.title.length > 0 || regions.subtitle.length > 0 || regions.header.length > 0)

const titleId = useId()

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
