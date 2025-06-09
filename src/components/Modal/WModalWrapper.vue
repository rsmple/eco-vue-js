<template>
  <WInfiniteListScrollingElement
    ref="content"
    class="
      bg-default dark:bg-default-dark w-modal-wrapper
      grid max-h-[calc(100%-var(--inner-margin,2rem)*2)]
      w-[--w-modal-wrapper-width,35rem]
      max-w-[calc(100%-var(--inner-margin,2rem)*2)] grid-cols-[1fr] grid-rows-[auto,1fr,auto] overflow-auto
      overscroll-contain rounded-[--w-modal-wrapper-rounded,1.5rem] shadow-md
    "
    :class="{
      'sm-not:max-w-full sm-not:h-full sm-not:rounded-none sm-not:max-h-full': maximized,
    }"
    :style="{
      '--w-modal-header-height': (headerRef?.offsetHeight ?? 0) + 'px',
      '--w-modal-footer-height': (footerRef?.offsetHeight ?? 0) + 'px',
      '--w-modal-content-height': (contentRef?.$el.offsetHeight ?? 0) + 'px'
    }"
  >
    <div
      ref="header"
      class="bg-default dark:bg-default-dark sm-not:w-screen sticky left-0 top-0 z-[1] w-[calc(var(--w-modal-wrapper-width,35rem)-var(--scroll-bar-width))]"
    >
      <div class="text-accent -p--w-modal-wrapper-padding flex items-center justify-center text-balance text-center text-xl font-semibold">
        <slot name="title" />
      </div>

      <slot name="subtitle" />
    </div>

    <div class="sm:-px--w-modal-wrapper-padding">
      <slot />
    </div>

    <div
      ref="footer"
      class="
        bg-default dark:bg-default-dark -gap--inner-margin -p--w-modal-wrapper-padding
        sm-not:w-screen sticky bottom-0 left-0 flex w-[calc(var(--w-modal-wrapper-width,35rem)-var(--scroll-bar-width))] justify-center
      "
      :class="{
        'sm-not:flex-col': !maximized,
      }"
      :style="{zIndex: BASE_ZINDEX_DROPDOWN}"
    >
      <slot name="actions" />
    </div>
  </WInfiniteListScrollingElement>
</template>

<script lang="ts" setup>
import {onMounted, provide, useTemplateRef} from 'vue'

import WInfiniteListScrollingElement from '@/components/InfiniteList/WInfiniteListScrollingElement.vue'

import {BASE_ZINDEX_DROPDOWN} from '@/utils/utils'

import {wModalHeaderHeight} from './models/injection'

defineProps<{
  maximized?: boolean
}>()

const headerRef = useTemplateRef('header')
const footerRef = useTemplateRef('footer')
const contentRef = useTemplateRef('content')

onMounted(() => {
  if (!headerRef.value) return

  provide(wModalHeaderHeight, headerRef.value.offsetHeight)
})
</script>
