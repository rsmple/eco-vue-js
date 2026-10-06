<template>
  <component
    :is="$slots.toggle?.({isTop, unclickable: isMobile ? true : undefined})[0]"
    ref="toggle"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import type {DropdownAdaptiveProps} from './types'

import {type VNode, computed, defineComponent, h, markRaw, onMounted, ref, useSlots, useTemplateRef, watch} from 'vue'

import OverlayRegionPart from '@/components/Modal/components/OverlayRegionPart.vue'
import {useOverlay, useOverlayFrame, useOverlayFrameOptions} from '@/utils/Overlay'
import {useIsMobile} from '@/utils/mobile'

// Opens the `content` slot with the overlay manager while `isOpen` is true — a dropdown at the `toggle` element, or a bottom sheet on phones.
const props = defineProps<DropdownAdaptiveProps>()

const emit = defineEmits<{
  /** The dropdown closed without `isOpen` turning false — a click outside, Escape, a swipe, or another dropdown taking its place. */
  (e: 'close'): void
}>()

defineOptions({inheritAttrs: false})

defineSlots<{
  /**
   * Element that opens the dropdown, which it points at. `isTop` is true while the dropdown is open above it.
   * On phones it is repeated at the top of the bottom sheet, unless there is a `header` — `unclickable` is true for the one on the page and false for the copy in the sheet.
   */
  toggle?: (props: {isTop: boolean, unclickable: boolean | undefined}) => VNode[]
  /** Heading of the bottom sheet on phones, instead of the copy of `toggle`. With `dialog`, the title of the dropdown too. */
  header?: () => VNode[]
  /** Content of the dropdown, which brings its own padding, unless it is a `dialog`. A click inside closes it with `closeOnClick`. */
  content?: () => VNode[]
}>()

const slots = useSlots()

const {isMobile} = useIsMobile()

const toggleRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('toggle')

const element = computed(() => props.parentElement ?? (toggleRef.value instanceof HTMLElement ? toggleRef.value : toggleRef.value?.$el as HTMLElement | undefined))

const isTop = ref(false)

// The overlay host renders the slot, as a component so it keeps this component's context.
// The content declares `close:modal`, which the host listens to on every content, as the slot may render several nodes for the listener to fall through to.
// In a bottom sheet, the content pins the `header` slot above itself, or else a copy of the toggle.
// A dialog hands the `header` slot to the frame's title instead, on every screen.
const renderContent = markRaw(defineComponent({
  emits: ['close:modal'],
  setup: () => {
    const isSheet = useOverlayFrame() === 'sheet'

    if (props.dialog) useOverlayFrameOptions(() => ({padded: true, fitContent: true}))

    const renderHeader = () => slots.header
      ? h('div', {class: 'flex items-center gap-2 py-2 text-base text-center font-semibold'}, slots.header())
      : slots.toggle?.({isTop: false, unclickable: false})

    const renderTitle = () => h('span', {class: 'inline-flex items-center gap-2'}, slots.header?.())

    return () => [
      props.dialog
        ? h(OverlayRegionPart, {region: 'title'}, {default: renderTitle})
        : isSheet ? h(OverlayRegionPart, {region: 'header'}, {default: renderHeader}) : null,
      slots.content?.(),
    ]
  },
}))

const overlay = useOverlay()

let closeDropdown: (() => void) | null = null

const open = () => {
  if (!element.value) return

  const value: (() => void) | null = overlay.open({
    present: 'dropdown',
    anchor: element.value,
    content: renderContent,
    dropdown: {
      align: props.horizontalAlign,
      frameClass: props.frameClass,
      closeOnClick: props.closeOnClick,
      onTop: value => isTop.value = value,
    },
    onClose: () => {
      if (closeDropdown !== value) return

      closeDropdown = null
      isTop.value = false

      if (props.isOpen) emit('close')
    },
  })

  closeDropdown = value

  if (!value) emit('close')
}

const close = () => {
  const value = closeDropdown

  closeDropdown = null
  isTop.value = false
  value?.()
}

onMounted(() => {
  watch(() => props.isOpen, value => {
    if (value) open()
    else close()
  }, {immediate: true})
})
</script>
