<template>
  <div
    :class="{
      'bg-surface border-line-subtle grid max-h-[min(40rem,calc(100vh-2rem))] w-[min(28rem,calc(100vw-var(--inner-margin,1fr)*2))] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-solid': frame === null,
      'pb-[50vh]': frame === 'sheet',
    }"
    role="region"
    class="grid grid-rows-[1fr_auto] h-full"
    :aria-label="title ?? 'Notifications'"
  >
    <OverlayHeader>
      <div
        class="flex items-center justify-between gap-4"
        :class="frame === null ? 'border-line-subtle border-b border-solid px-4 py-3' : frame === 'sheet' ? 'pb-4' : undefined"
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
    </OverlayHeader>

    <div
      v-if="!notifyCenterItems.length"
      class="text-description py-2 text-center self-center"
    >
      {{ emptyText ?? 'No notifications yet' }}
    </div>

    <div
      v-else
      class="grid content-start"
      :class="frame === null ? 'overflow-y-auto overscroll-contain px-4 py-3' : frame === 'dropdown' ? 'px-3 pb-2 pt-1' : 'px-3 py-1'"
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

    <div
      v-if="$slots.footer"
      class="border-line-subtle border-t border-solid sticky bottom-0 bg-surface"
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
