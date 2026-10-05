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

import OverlayHeader from '@/components/Modal/components/OverlayHeader.vue'
import {useOverlay, useOverlayFrame} from '@/utils/Overlay'
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
  /** Heading of the bottom sheet on phones, instead of the copy of `toggle`. */
  header?: () => VNode[]
  /** Content of the dropdown, which brings its own padding. A click inside closes it with `closeOnClick`. */
  content?: () => VNode[]
}>()

const slots = useSlots()

const {isMobile} = useIsMobile()

const toggleRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('toggle')

const element = computed(() => props.parentElement ?? (toggleRef.value instanceof HTMLElement ? toggleRef.value : toggleRef.value?.$el as HTMLElement | undefined))

const isTop = ref(false)

// The overlay host renders the slots, as components so they keep this component's context.
// The content declares `close:modal`, which the host listens to on every content, as the slot may render several nodes for the listener to fall through to.
// In a bottom sheet without a `header`, the content pins a copy of the toggle above itself.
const renderContent = markRaw(defineComponent({
  emits: ['close:modal'],
  setup: () => {
    const hasToggleCopy = useOverlayFrame() === 'sheet' && !slots.header

    return () => [
      hasToggleCopy ? h(OverlayHeader, null, {default: () => slots.toggle?.({isTop: false, unclickable: false})}) : null,
      slots.content?.(),
    ]
  },
}))
const renderHeader = markRaw(() => slots.header?.())

const overlay = useOverlay()

let closeDropdown: (() => void) | null = null

const open = () => {
  if (!element.value) return

  const value: (() => void) | null = overlay.open({
    present: 'dropdown',
    anchor: element.value,
    content: renderContent,
    nested: props.nested,
    dropdown: {
      align: props.horizontalAlign,
      frameClass: props.frameClass,
      closeOnClick: props.closeOnClick,
      title: slots.header ? renderHeader : undefined,
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
