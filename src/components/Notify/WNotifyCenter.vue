<template>
  <!-- On a page it is framed and scrolls its list itself. In an overlay the frame does both, and pins the header above the list. -->
  <div
    :class="{
      'bg-surface border-line-subtle grid max-h-[min(40rem,calc(100vh-2rem))] w-[min(28rem,calc(100vw-1rem))] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-solid': frame === null,
      'pb-[50vh]': frame === 'sheet',
    }"
    role="region"
    :aria-label="title ?? 'Notifications'"
  >
    <OverlayHeader>
      <div
        class="flex items-center justify-between gap-4"
        :class="{
          'border-line-subtle border-b border-solid px-4 py-3': frame === null,
          'pb-4': frame === 'sheet',
        }"
      >
        <div class="text-accent font-semibold">
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
    </OverlayHeader>

    <div
      class="grid content-start gap-2"
      :class="frame === null ? 'overflow-y-auto overscroll-contain p-4' : frame === 'sheet' ? 'px-3' : 'p-2'"
    >
      <div
        v-if="!notifyCenterItems.length"
        class="text-description py-10 text-center"
      >
        {{ emptyText ?? 'No notifications yet' }}
      </div>

      <template v-if="notifyCenterActionItems.length">
        <div class="tone-negative text-tone px-2 pt-1 text-xs font-semibold uppercase">
          {{ actionText ?? 'Action required' }}
        </div>

        <NotifyCard
          v-for="item in notifyCenterActionEntries"
          :key="getNotifyItemKey(item)"
          :item="item"
          history
          @click:close="removeNotifyEntry"
        />

        <div
          v-if="notifyCenterActivityItems.length"
          class="text-description px-2 pt-2 text-xs font-semibold uppercase"
        >
          {{ activityText ?? 'Activity' }}
        </div>
      </template>

      <NotifyCard
        v-for="item in notifyCenterActivityEntries"
        :key="getNotifyItemKey(item)"
        :item="item"
        history
        @click:close="removeNotifyEntry"
      />
    </div>

    <div
      v-if="$slots.footer"
      class="border-line-subtle border-t border-solid"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {NotifyCenterProps} from './types'

import WButton from '@/components/Button/WButton.vue'

import OverlayHeader from '@/components/Modal/components/OverlayHeader.vue'
import {useOverlayFrame} from '@/utils/Overlay'
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
</script>
