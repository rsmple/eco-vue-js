<template>
  <div class="list:left---left-inner list:w---width-inner list:sticky grid w-full grid-cols-[1fr_auto] pb-3">
    <div class="flex">
      <slot
        v-bind="{
          disableMessage: disableMessageValue,
          cssClass: 'border-l border-solid border-line first:border-l-0'
        }"
      />

      <WButtonSelectionAction
        v-if="$slots.more"
        ref="moreToggle"
        title="More"
        :icon="markRaw(IconMore)"
        :aria-expanded="isOpen"
        :disable-message="disableMessageValue"
        class="border-l border-solid border-line"
        :class="moreToggleClass"
        @click="toggleMore"
      />
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
import {type VNode, computed, inject, markRaw, provide, ref, useSlots, useTemplateRef} from 'vue'

import IconMore from '@/assets/icons/IconMore.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {useOverlay} from '@/utils/Overlay'
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

const slots = useSlots()

// The overlay host renders the menu, as a component so the slot keeps this component's context.
const renderMore = markRaw(() => slots.more?.({
  disableMessage: disableMessageValue.value,
  cssClass: 'first:pt-2 last:pb-2',
}))

const moreToggleRef = useTemplateRef<ComponentInstance<typeof WButtonSelectionAction>>('moreToggle')

const overlay = useOverlay()

let closeMore: (() => void) | null = null
const isOpen = ref(false)

const toggleMore = () => {
  if (closeMore) {
    closeMore()

    return
  }

  const anchor = moreToggleRef.value?.$el as Element | undefined

  if (!anchor) return

  // An action opened from the menu with `useOverlay` takes its place, and a confirm sticks to the More button.
  const value: (() => void) | null = overlay.open({
    present: 'dropdown',
    anchor,
    content: renderMore,
    dropdown: {
      align: HorizontalAlign.RIGHT_INNER,
      closeOnClick: true,
      frameClass: 'surface-raised dropdown w-shine-hidden my-2 grid grid-cols-1 overflow-hidden rounded-xl shadow-md outline-1 outline-line-raised',
      // `dropdown` shows the actions' titles, which the bar hides on phones.
      sheetClass: 'dropdown grid grid-cols-1',
    },
    onClose: () => {
      if (closeMore !== value) return

      closeMore = null
      isOpen.value = false
    },
  })

  closeMore = value
  isOpen.value = value !== null
}

defineSlots<{
  /** WButtonSelectionAction buttons. Pass them `disableMessage`, and `cssClass` for the dividers between them. */
  default?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  /** Actions in the More menu at the end of the row. */
  more?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  /** Content at the end of the bar while nothing is selected, such as list settings. */
  settings?: () => VNode[]
}>()
</script>