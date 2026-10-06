<template>
  <!--
    Frame of a `modal` layer: the box over the backdrop with the title pinned at the top, the buttons at the bottom, and the content scrolling between.
    The content's WModalWrapper hands its parts and its look over. Until it does, such as while the content loads, the box stays bare, so nothing flashes.
  -->
  <WInfiniteListScrollingElement
    ref="content"
    :role="options ? 'dialog' : undefined"
    :aria-modal="options ? 'true' : undefined"
    :aria-labelledby="regions.title.length ? titleId : undefined"
    :class="options ? [
      `
        bg-surface w-modal-wrapper [--w-frame-padding:var(--w-modal-wrapper-padding)]
        scrollbar-width-thin grid
        max-h-[calc(100%-var(--inner-margin,2rem)*2)]
        w-(--w-modal-wrapper-width,35rem) max-w-[calc(100%-var(--inner-margin,2rem)*2)] grid-cols-[1fr] grid-rows-[auto_1fr_auto]
        overflow-auto overscroll-contain rounded-(--w-modal-wrapper-rounded,1.5rem) shadow-md
      `,
      {'sm-not:max-w-full sm-not:h-full sm-not:rounded-none sm-not:max-h-full': options.maximized},
      options.class,
    ] : undefined"
    :style="{
      '--w-modal-header-height': headerHeight + 'px',
      '--w-modal-footer-height': footerHeight + 'px',
      '--w-modal-content-height': contentHeight + 'px'
    }"
  >
    <div
      ref="header"
      :class="options ? [
        'bg-surface sticky left-0 top-0 z-1 w-(--w-width-inner-out)',
        options.maximized ? 'sm-not:w-screen' : 'sm-not:w-full',
      ] : undefined"
    >
      <h2
        v-if="options"
        :id="titleId"
        class="text-accent p-(--w-frame-padding) flex items-center justify-center text-balance text-center text-xl font-semibold"
      >
        <OverlayRegion :parts="regions.title" />
      </h2>

      <OverlayRegion :parts="regions.subtitle" />
    </div>

    <!-- A dialog's body is padded like the title and the buttons; content that reaches the edges, such as a list, takes `w-frame-bleed`. -->
    <div :class="options?.padded ? 'px-(--w-frame-padding)' : '[--w-frame-padding:0px]'">
      <slot />
    </div>

    <div
      ref="footer"
      :class="options ? [
        `
          bg-surface gap---inner-margin p-(--w-frame-padding)
          md-not:pb-8 sticky bottom-0 left-0 flex w-(--w-width-inner-out) justify-center
        `,
        options.maximized ? 'sm-not:w-screen' : 'sm-not:flex-col sm-not:w-full',
        {'flex-col': options.actionsCol},
      ] : undefined"
      :style="{zIndex: BASE_ZINDEX_DROPDOWN}"
    >
      <OverlayRegion :parts="regions.actions" />
    </div>
  </WInfiniteListScrollingElement>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, provide, ref, useId, useTemplateRef} from 'vue'

import WInfiniteListScrollingElement from '@/components/InfiniteList/WInfiniteListScrollingElement.vue'

import {BASE_ZINDEX_DROPDOWN} from '@/utils/utils'

import OverlayRegion from './OverlayRegion.vue'

import {wModalHeaderHeight} from '../models/injection'
import {useOverlayRegions} from '../use/useOverlayRegions'

const {regions, options} = useOverlayRegions(['title', 'subtitle', 'actions'])

const titleId = useId()

const headerRef = useTemplateRef('header')
const footerRef = useTemplateRef('footer')
const contentRef = useTemplateRef<{$el: HTMLElement}>('content')

const headerHeight = ref(0)
const footerHeight = ref(0)
const contentHeight = ref(0)

provide(wModalHeaderHeight, headerHeight)

let observer: ResizeObserver | null = null

onMounted(() => {
  const setters = new Map<Element, (height: number) => void>([
    [headerRef.value!, value => headerHeight.value = value],
    [footerRef.value!, value => footerHeight.value = value],
    [contentRef.value!.$el, value => contentHeight.value = value],
  ])

  observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      setters.get(entry.target)?.(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
    }
  })

  setters.forEach((_, element) => observer?.observe(element))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>
