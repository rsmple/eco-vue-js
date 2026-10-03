<template>
  <div class="list:left---left-inner list:w---width-inner list:sticky grid w-full grid-cols-[1fr_auto] pb-3">
    <div class="flex">
      <slot
        v-bind="{
          disableMessage: disableMessageValue,
          cssClass: 'border-l border-solid border-line first:border-l-0'
        }"
      />

      <WDropdownMenu
        v-if="$slots.more"
        :is-open="isOpen"
        :horizontal-align="HorizontalAlign.RIGHT_INNER"
        :class="moreToggleClass"
      >
        <template #toggle>
          <WButtonSelectionAction
            title="More"
            :icon="markRaw(IconMore)"
            :aria-expanded="isOpen"
            :disable-message="disableMessageValue"
            class="border-l border-solid border-line"
            @click="isOpen = !isOpen"
          />
        </template>

        <template #content>
          <WClickOutside
            class="surface-raised dropdown w-shine-hidden my-2 grid grid-cols-1 overflow-hidden rounded-xl shadow-md outline-1 outline-line-raised"
            @click="isOpen = false"
          >
            <slot
              name="more"
              v-bind="{
                disableMessage: disableMessageValue,
                cssClass: 'first:pt-2 last:pb-2'
              }"
            />
          </WClickOutside>
        </template>
      </WDropdownMenu>
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

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconMore from '@/assets/icons/IconMore.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {BASE_ZINDEX_LIST_HEADER, numberFormatter, wBaseZIndex} from '@/utils/utils'

import WButtonSelectionAction from './WButtonSelectionAction.vue'
import WButtonSelectionState from './WButtonSelectionState.vue'

import WClickOutside from '../ClickOutside/WClickOutside.vue'

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

const isOpen = ref(false)

const disableMessageValue = computed<string | undefined>(() => props.selectedCount === 0 ? props.disableMessage : undefined)

defineSlots<{
  /** WButtonSelectionAction buttons. Pass them `disableMessage`, and `cssClass` for the dividers between them. */
  default?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  /** Actions in the More menu at the end of the row. */
  more?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  /** Content at the end of the bar while nothing is selected, such as list settings. */
  settings?: () => VNode[]
}>()
</script>