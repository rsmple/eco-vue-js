<template>
  <component
    :is="tag ?? 'div'"
    class="relative"
    :class="{'w-skeleton-static [&_.w-skeleton]:opacity-40': failedQuery}"
  >
    <slot />

    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="failedQuery && !isShownByQueryStatus"
        class="absolute inset-0 flex items-center justify-center p-3"
        @click.prevent.stop
      >
        <div
          class="bg-surface flex max-w-full items-center gap-3 rounded-xl py-1.5 pr-1.5 pl-3 text-xs shadow-md"
          role="alert"
        >
          <span class="text-accent min-w-0">{{ message }}</span>

          <WButton
            v-if="isRetryableError(failedQuery.error.value)"
            :semantic-type="SemanticType.SECONDARY"
            class="w-button-h-7 shrink-0 text-xs"
            @click="retry"
          >
            {{ getText('retry') }}
          </WButton>
        </div>
      </div>
    </Transition>
  </component>
</template>

<script lang="ts" setup>
import type {BoundaryQuery} from './types'

import {computed} from 'vue'

import WButton from '@/components/Button/WButton.vue'

import {SemanticType} from '@/utils/SemanticType'
import {ApiErrorCancel} from '@/utils/api'
import {getLoadErrorMessage, isRetryableError} from '@/utils/queryClient'
import {getText} from '@/utils/texts'

import {queryStatusMountedCount} from '../QueryStatus/models/mounted'

const props = defineProps<{
  /** The queries the content shows, such as `[queryStats, queryItems]`. When one of them failed without data, its skeletons stop and grey out under a message, with Retry when asking again may help. With a `WQueryStatus` in the app, a failure asking again may fix is told there instead, and the content only greys out. */
  queries: BoundaryQuery[]
  /** Element that wraps the content. Inside a card that is a link or has its own layout, `class="contents"` keeps the card's layout, and the message centers on the nearest positioned ancestor. */
  tag?: keyof HTMLElementTagNameMap
}>()

defineSlots<{
  /** The content, with its own skeletons while the queries load. */
  default?: () => void
}>()

const isFailed = (query: BoundaryQuery): boolean => {
  return !!query.error.value && !(query.error.value instanceof ApiErrorCancel) && query.data.value === undefined
}

const failedQuery = computed(() => props.queries.find(isFailed))

const isShownByQueryStatus = computed(() => queryStatusMountedCount.value > 0 && isRetryableError(failedQuery.value?.error.value))

const message = computed(() => getLoadErrorMessage(failedQuery.value?.error.value))

const retry = () => {
  props.queries.filter(isFailed).forEach(query => void query.refetch())
}
</script>
