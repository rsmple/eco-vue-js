<template>
  <div
    ref="container"
    class="grid gap-3"
  >
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
      <form
        class="flex items-center gap-2"
        @submit.prevent="jump"
      >
        <WInput
          v-model="row"
          type="number"
          :min="1"
          :max="EVENT_COUNT"
          placeholder="Row"
          class="w-28"
          no-margin
        />

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          type="submit"
        >
          Go to row
        </WButton>
      </form>

      <span class="text-description text-sm tabular-nums">
        {{ rendered }} of {{ count.toLocaleString('en') }} rows rendered
      </span>
    </div>

    <WInfiniteListScrollingElement class="h-96 overflow-y-auto overscroll-contain rounded-xl border border-solid border-line-subtle">
      <WInfiniteList
        ref="list"
        :use-query-fn="eventModelApi.paginated.use"
        :query-params="{}"
        :page-length="PAGE_LENGTH"
        page-class="grid"
        min-height-only
        @update:count="count = $event"
      >
        <template #default="{item, skeleton, position}">
          <div
            class="event-row flex h-9 items-center gap-3 border-b border-solid border-line-subtle px-4 text-sm"
          >
            <span class="text-description w-12 text-right tabular-nums">
              {{ position + 1 }}
            </span>

            <WSkeleton v-if="skeleton" />

            <template v-else>
              <span
                class="w-16 font-semibold"
                :class="levelClass[item.level]"
              >
                {{ item.level }}
              </span>

              <span class="text-description w-12 tabular-nums">
                {{ timeFormatter.format(item.at) }}
              </span>

              <span class="truncate">{{ item.message }}</span>
            </template>
          </div>
        </template>
      </WInfiniteList>
    </WInfiniteListScrollingElement>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInfiniteList from 'eco-vue-js/dist/components/InfiniteList/WInfiniteList.vue'
import WInfiniteListScrollingElement from 'eco-vue-js/dist/components/InfiniteList/WInfiniteListScrollingElement.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {EVENT_COUNT, EventLevel, eventModelApi} from './api/Event'

const PAGE_LENGTH = 50

const levelClass: Record<EventLevel, string> = {
  [EventLevel.INFO]: 'tone-info text-tone',
  [EventLevel.WARNING]: 'tone-warning text-tone',
  [EventLevel.ERROR]: 'tone-negative text-tone',
}

const timeFormatter = Intl.DateTimeFormat('en', {hour: '2-digit', minute: '2-digit', hourCycle: 'h23'})

const listRef = useTemplateRef('list')
const containerRef = useTemplateRef('container')

const count = ref(0)
const row = ref<number>()

// Scrolls to a loaded page, or starts the list over from the row's page.
const jump = () => {
  if (!row.value) return

  const index = Math.min(Math.max(row.value, 1), count.value || EVENT_COUNT) - 1

  listRef.value?.goto(Math.floor(index / PAGE_LENGTH) + 1, index % PAGE_LENGTH)
}

// Only for the demo: counts the rows in the DOM, to show that only a few pages are rendered at a time.
const rendered = ref(0)

let observer: MutationObserver | undefined

onMounted(() => {
  observer = new MutationObserver(() => {
    rendered.value = containerRef.value?.querySelectorAll('.event-row').length ?? 0
  })

  if (containerRef.value) observer.observe(containerRef.value, {childList: true, subtree: true})
})

onBeforeUnmount(() => observer?.disconnect())
</script>
