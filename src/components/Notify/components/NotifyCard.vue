<template>
  <div
    class="text-accent relative grid grid-cols-[auto_1fr] gap-x-4 rounded-xl border border-l-4 border-solid border-line-subtle border-l-tone-fill pl-4 text-sm"
    :class="[
      notifyTypeToneMap[item.type],
      history ? 'bg-surface-subtle w-full' : 'bg-surface-raised my-1.5 w-[min(24rem,calc(100vw-2rem))] shadow-lg',
    ]"
  >
    <WCounter
      v-show="item.count > 1"
      class="absolute left-[-0.75em] top-[-0.5em] text-xs shadow-md"
      :count="item.count"
      :semantic-type="notifyTypeSemanticTypeMap[item.type]"
    />

    <div class="py-2.5">
      <component
        :is="notifyTypeIconMap[item.type]"
        class="text-tone-fill square-5"
      />
    </div>

    <div class="grid grid-cols-[1fr_auto] gap-4">
      <div class="py-2.5 font-semibold">
        <template v-if="typeof item.title === 'string'">
          {{ item.title }}
        </template>
        <component
          :is="item.title"
          v-else
        />
      </div>

      <button
        v-if="!(history && isNotifyPending(item))"
        class="w-ripple-trigger w-ripple-hover text-description flex cursor-pointer self-start p-2"
        aria-label="Close notification"
        @click.stop="$emit('click:close', item)"
      >
        <div class="square-6 w-ripple relative flex items-center justify-center rounded-full">
          <IconCancel class="square-3.5" />
        </div>
      </button>
    </div>

    <div class="col-start-2 -mt-1.5 grid grid-cols-1 gap-1 pb-2 pr-4">
      <div
        v-if="typeof item.caption === 'string' || item.userInput"
        class="whitespace-pre-wrap wrap-break-word [word-break:break-word]"
      >{{ item.caption }}<span
        v-if="item.userInput"
        class="break-all"
      >{{ item.caption ? ' ' : '' }}{{ item.userInput }}</span></div>
      <component
        :is="item.caption"
        v-else-if="item.caption"
      />

      <component
        :is="item.component"
        v-if="item.component"
        v-bind="item.componentProps"
        @update="updateNotify(item.id, $event)"
        @remove="discardNotify(item.id)"
      />

      <WButton
        v-if="item.to"
        :to="item.to"
        :semantic-type="SemanticType.SECONDARY"
        class="w-button-h-8 mt-1 justify-self-start text-xs"
      >
        {{ linkText }} <IconBack class="rotate-180" />
      </WButton>

      <template v-if="item.items">
        <button
          class="tone-primary text-tone mt-1 cursor-pointer justify-self-start text-xs font-semibold"
          :aria-expanded="isExpanded"
          @click.stop="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Hide' : `Show all ${ item.items.length }` }}
        </button>

        <div
          v-show="isExpanded"
          class="grid max-h-60 overflow-y-auto overscroll-y-contain text-xs"
        >
          <div
            v-for="child in item.items"
            :key="child.id"
            class="border-line-subtle grid grid-cols-[auto_1fr_auto] items-center gap-x-2 border-t border-solid py-1"
          >
            <component
              :is="notifyTypeIconMap[child.type]"
              :class="notifyTypeToneMap[child.type]"
              class="text-tone square-4"
            />

            <div class="flex min-w-0 items-center gap-2">
              <div class="min-w-0 flex-1 truncate">
                <template v-if="typeof (child.caption || child.title) === 'string'">
                  {{ child.caption || child.title }}
                </template>
                <component
                  :is="child.caption || child.title"
                  v-else
                />
              </div>

              <component
                :is="child.component"
                v-if="child.component"
                v-bind="child.componentProps"
                compact
                @update="updateNotify(child.id, $event)"
                @remove="discardNotify(child.id)"
              />
            </div>

            <button
              v-if="!isNotifyPending(child)"
              class="w-ripple-trigger w-ripple-hover text-description flex cursor-pointer"
              aria-label="Close notification"
              @click.stop="$emit('click:close', child)"
            >
              <div class="square-6 w-ripple relative flex items-center justify-center rounded-full">
                <IconCancel class="square-3" />
              </div>
            </button>

            <div
              v-else
              class="square-6"
            />
          </div>
        </div>
      </template>

      <div
        v-if="history"
        class="text-description text-xs"
      >
        {{ isSameDate(new Date(), item.date) ? timeFormat(item.date) : datetimeFormat(item.date, {year: 'auto', seconds: false}) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {NotifyItem} from '../models/types'

import {computed, ref} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WCounter from '@/components/Counter/WCounter.vue'

import IconBack from '@/assets/icons/IconBack.svg?component'
import IconCancel from '@/assets/icons/IconCancel.svg?component'

import {useOptionalRouter} from '@/composables/useOptionalRouter'
import {SemanticType} from '@/utils/SemanticType'
import {datetimeFormat, isSameDate, timeFormat} from '@/utils/dateTime'

import {NotifyType} from '../models/NotifyType'
import {discardNotify, isNotifyPending, notifyTypeIconMap, notifyTypeSemanticTypeMap, updateNotify} from '../models/notifyCenter'

const props = defineProps<{
  item: NotifyItem
  /** Shown in the notify center: full width, with the time, and a pending one can't be closed. */
  history?: boolean
}>()

defineEmits<{
  (e: 'click:close', value: NotifyItem): void
}>()

const notifyTypeToneMap: Record<NotifyType, string> = {
  [NotifyType.PENDING]: 'tone-primary',
  [NotifyType.SUCCESS]: 'tone-positive',
  [NotifyType.WARN]: 'tone-warning',
  [NotifyType.DANGER]: 'tone-negative',
}

const router = useOptionalRouter()

const isExpanded = ref(false)

const linkText = computed(() => {
  if (!props.item.to) return undefined

  if (props.item.to instanceof Object && 'meta' in props.item.to && props.item.to.meta instanceof Object && 'title' in props.item.to.meta) {
    return props.item.to.meta.title
  }

  return router.resolve(props.item.to).meta?.title
})
</script>
