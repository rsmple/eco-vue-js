<template>
  <div class="list:left---left-inner list:w---width-inner list:sticky grid w-full grid-cols-[1fr_auto] pb-3">
    <!-- Actions keep their width; the ones that do not fit beside the end of the bar are hidden, and the More menu takes them. -->
    <div
      ref="row"
      class="flex min-w-0"
    >
      <slot
        v-bind="{
          disableMessage: disableMessageValue,
          cssClass: 'shrink-0 border-l border-solid border-line first:border-l-0',
          visibleCount,
        }"
      />

      <WDropdownAdaptive
        v-if="$slots.more"
        :is-open="isOpen"
        close-on-click
        @close="isOpen = false"
      >
        <template #toggle>
          <WButtonSelectionAction
            title="More"
            :icon="markRaw(IconMore)"
            :aria-expanded="isOpen"
            :disable-message="disableMessageValue"
            class="shrink-0 border-l border-solid border-line"
            :class="{hidden: !isOverflowing}"
            v-bind="{'data-selection-more': ''}"
            @click="isOpen = !isOpen"
          />
        </template>

        <template #header>
          More
        </template>

        <template #content>
          <div class="py-2">
            <slot
              name="more"
              v-bind="{
                disableMessage: disableMessageValue,
                cssClass: '',
                visibleCount,
              }"
            />
          </div>
        </template>
      </WDropdownAdaptive>
    </div>

    <WButtonSelectionState
      v-if="selectedCount"
      @click="$emit('clear:selection')"
    >
      <span class="sm-not:hidden">Selected&nbsp;</span><span class="tone-primary text-tone font-semibold">{{ numberFormatter.format(selectedCount) }}</span><span class="sm-not:text-xs">&nbsp;{{ title }}{{ selectedCount === 1 ? '' : 's' }}</span>
    </WButtonSelectionState>

    <slot
      v-else
      name="settings"
    />
  </div>
</template>

<script lang="ts" setup>
import {type VNode, computed, inject, markRaw, onBeforeUnmount, onMounted, onUpdated, provide, ref, useTemplateRef} from 'vue'

import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'

import IconMore from '@/assets/icons/IconMore.svg?component'

import {BASE_ZINDEX_LIST_HEADER, numberFormatter, wBaseZIndex} from '@/utils/utils'

import WButtonSelectionAction from './WButtonSelectionAction.vue'
import WButtonSelectionState from './WButtonSelectionState.vue'

const props = withDefaults(
  defineProps<{
    /** Singular noun in the "Selected N items" counter. An "s" is added for more than one. */
    title?: string
    /** Tooltip of the actions while nothing is selected, which also disables them. */
    disableMessage?: string
    /** Number of selected items. While it is above 0, the counter with a clear button replaces the `settings` slot. */
    selectedCount?: number
  }>(),
  {
    title: 'item',
    disableMessage: 'No selected items',
    selectedCount: undefined,
  },
)

defineEmits<{
  /** The clear button of the counter was clicked. */
  (e: 'clear:selection'): void
}>()

const baseZIndex = inject(wBaseZIndex, null)

provide(wBaseZIndex, baseZIndex ?? BASE_ZINDEX_LIST_HEADER)

const disableMessageValue = computed<string | undefined>(() => props.selectedCount === 0 ? props.disableMessage : undefined)

const isOpen = ref(false)

const rowRef = useTemplateRef('row')

/** How many actions of the row fit, from the first. The rest are hidden by the `default` slot and shown by the `more` slot. */
const visibleCount = ref(Infinity)
const isOverflowing = ref(false)

// Widths of the actions as last shown: a hidden one has none, so it keeps the one it had.
const widths = new WeakMap<Element, number>()
let moreWidth = 0

const isShown = (element: Element) => element.getClientRects().length > 0

const update = () => {
  const row = rowRef.value

  if (!row) return

  const children = Array.from(row.children)
  const items = children.filter(element => !element.hasAttribute('data-selection-more'))
  const more = children.find(element => element.hasAttribute('data-selection-more'))

  items.forEach(element => {
    if (isShown(element)) widths.set(element, element.getBoundingClientRect().width)
  })

  if (more && isShown(more)) moreWidth = more.getBoundingClientRect().width

  // An action not shown yet, such as one of the bulk actions once something is selected, is shown to be measured first.
  if (items.some(element => !widths.has(element))) {
    visibleCount.value = Infinity
    isOverflowing.value = false
    return
  }

  const available = row.clientWidth
  const total = items.reduce((sum, element) => sum + widths.get(element)!, 0)

  if (total <= available || !more) {
    visibleCount.value = Infinity
    isOverflowing.value = false
    return
  }

  let count = 0
  let used = moreWidth

  while (count < items.length && used + widths.get(items[count]!)! <= available) {
    used += widths.get(items[count]!)!
    count++
  }

  visibleCount.value = count
  isOverflowing.value = true
}

let observer: ResizeObserver | null = null

// The row resizes with the screen and the end of the bar; an action resizes as its text changes.
const observe = () => {
  if (!observer || !rowRef.value) return

  observer.disconnect()
  observer.observe(rowRef.value)
  Array.from(rowRef.value.children).forEach(element => observer?.observe(element))
}

onMounted(() => {
  observer = new ResizeObserver(update)
  observe()
})

onUpdated(observe)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

defineSlots<{
  /**
   * WButtonSelectionAction buttons. Pass them `disableMessage`, and `cssClass` for the dividers between them.
   * Hide the ones from `visibleCount` on, which do not fit — the `more` slot shows them instead.
   */
  default?: (props: {disableMessage: string | undefined, cssClass: string, visibleCount: number}) => VNode[]
  /** Actions in the More menu at the end of the row: the ones of the `default` slot from `visibleCount` on, which do not fit the row. The menu shows only when some do not. */
  more?: (props: {disableMessage: string | undefined, cssClass: string, visibleCount: number}) => VNode[]
  /** Content at the end of the bar while nothing is selected, such as list settings. */
  settings?: () => VNode[]
}>()
</script>