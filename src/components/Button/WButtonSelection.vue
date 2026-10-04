<template>
  <div class="list:left---left-inner list:w---width-inner list:sticky grid w-full grid-cols-[1fr_auto] pb-3">
    <div class="flex">
      <slot
        v-bind="{
          disableMessage: disableMessageValue,
          cssClass: 'border-l border-solid border-line first:border-l-0'
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
            class="border-l border-solid border-line"
            :class="moreToggleClass"
            @click="isOpen = !isOpen"
          />
        </template>

        <template #header>
          More
        </template>

        <template #content>
          <slot
            name="more"
            v-bind="{
              disableMessage: disableMessageValue,
              cssClass: 'first:pt-2 last:pb-2',
            }"
          />
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
import {type VNode, computed, inject, markRaw, provide, ref} from 'vue'

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
    /** Class of the More menu's toggle, e.g. to hide it while all actions fit. */
    moreToggleClass?: string
  }>(),
  {
    title: 'item',
    disableMessage: 'No selected items',
    selectedCount: undefined,
    moreToggleClass: undefined,
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

defineSlots<{
  /** WButtonSelectionAction buttons. Pass them `disableMessage`, and `cssClass` for the dividers between them. */
  default?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  /** Actions in the More menu at the end of the row. */
  more?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  /** Content at the end of the bar while nothing is selected, such as list settings. */
  settings?: () => VNode[]
}>()
</script>