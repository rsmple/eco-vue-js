<template>
  <div
    :class="{
      'bg-surface border-line-subtle max-h-[min(40rem,calc(100vh-2rem))] w-[min(28rem,calc(100vw-var(--inner-margin,1fr)*2))] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-solid': frame === null,
      'flex-1': frame === 'dropdown',
      'pb-[50vh]': frame === 'sheet',
    }"
    role="region"
    class="grid"
    :aria-label="title ?? 'Notifications'"
  >
    <OverlayRegionPart region="header">
      <div
        class="flex items-center justify-between gap-4"
        :class="{'border-line-subtle border-b border-solid px-4 py-3': frame === null}"
      >
        <div class="text-accent font-semibold h-8 flex items-center">
          {{ title ?? 'Notifications' }}
        </div>

        <WButton
          v-if="notifyCenterActivityItems.length"
          :semantic-type="SemanticType.SECONDARY"
          class="w-button-h-8 text-xs"
          @click.stop="clearNotifyHistory"
        >
          {{ clearText ?? 'Clear' }}
        </WButton>
      </div>
    </OverlayRegionPart>

    <div
      v-if="!notifyCenterItems.length"
      class="text-description py-2 text-center self-center"
    >
      {{ emptyText ?? 'No notifications yet' }}
    </div>

    <div
      v-else
      class="grid content-start"
      :class="frame === null ? 'overflow-y-auto overscroll-contain px-4 py-3' : 'pt-1'"
    >
      <div
        v-if="notifyCenterActionItems.length"
        class="tone-negative text-tone py-1 text-xs font-semibold uppercase"
      >
        {{ actionText ?? 'Action required' }}
      </div>

      <TransitionGroup
        enter-from-class="opacity-0 grid-rows-[0fr]"
        enter-to-class="opacity-1 grid-rows-[1fr]"
        leave-from-class="opacity-1 grid-rows-[1fr]"
        leave-to-class="opacity-0 grid-rows-[0fr]"
      >
        <div
          v-for="item in notifyCenterActionEntries"
          :key="getNotifyItemKey(item)"
          class="grid transition-[transform,grid-template-rows] duration-300"
        >
          <div class="min-h-0">
            <NotifyCard
              :item="item"
              history
              class="my-1"
              @click:close="removeNotifyEntry"
            />
          </div>
        </div>
      </TransitionGroup>

      <div
        v-if="notifyCenterActivityItems.length && notifyCenterActionItems.length"
        class="text-description pt-2 pb-1 text-xs font-semibold uppercase"
      >
        {{ activityText ?? 'Activity' }}
      </div>

      <TransitionGroup
        enter-from-class="opacity-0 grid-rows-[0fr]"
        enter-to-class="opacity-1 grid-rows-[1fr]"
        leave-from-class="opacity-1 grid-rows-[1fr]"
        leave-to-class="opacity-0 grid-rows-[0fr]"
      >
        <div
          v-for="item in notifyCenterActivityEntries"
          :key="getNotifyItemKey(item)"
          class="grid transition-[transform,grid-template-rows] duration-300"
        >
          <div class="min-h-0">
            <NotifyCard
              :item="item"
              history
              class="my-1"
              @click:close="removeNotifyEntry"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- In an overlay, the frame pins it under the list with its buttons. -->
    <OverlayRegionPart
      v-if="$slots.footer"
      region="actions"
    >
      <div
        class="min-w-0 flex-1"
        :class="{'border-line-subtle border-t border-solid px-4 py-3': frame === null}"
      >
        <slot name="footer" />
      </div>
    </OverlayRegionPart>
  </div>
</template>

<script lang="ts" setup>
import type {NotifyCenterProps} from './types'

import WButton from '@/components/Button/WButton.vue'

import OverlayRegionPart from '@/components/Modal/components/OverlayRegionPart.vue'
import {useOverlayFrame, useOverlayFrameOptions} from '@/utils/Overlay'
import {SemanticType} from '@/utils/SemanticType'

import NotifyCard from './components/NotifyCard.vue'
import {
  clearNotifyHistory,
  getNotifyItemKey,
  notifyCenterActionEntries,
  notifyCenterActionItems,
  notifyCenterActivityEntries,
  notifyCenterActivityItems,
  notifyCenterItems,
  removeNotifyEntry,
} from './models/notifyCenter'

defineProps<NotifyCenterProps>()

defineSlots<{
  /** Under the list, such as a link to a page with every operation. Close the center from it with `closeNotifyCenter`. */
  footer?: () => void
}>()

const frame = useOverlayFrame()

// In an overlay, the frame pads the header, the list and the footer; on its own, it is the frame.
useOverlayFrameOptions(() => ({padded: true}))
</script>
