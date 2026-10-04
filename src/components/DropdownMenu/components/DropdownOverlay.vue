<template>
  <component
    :is="unwrapSlots($slots.toggle?.({unclickable: repeatToggle && isMobile ? true : undefined, isTop}) ?? [])[0]"
    ref="container"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import {type VNode, computed, defineComponent, inject, markRaw, onMounted, onUnmounted, ref, useSlots, useTemplateRef, watch} from 'vue'

import {wOverlayIsTop} from '@/components/Modal/models/overlayRegistry'
import {type OverlayDropdownOptions, useOverlay} from '@/utils/Overlay'
import {useIsMobile} from '@/utils/mobile'
import {unwrapSlots} from '@/utils/utils'

// Opens the `content` slot with the overlay manager at the `toggle` element while `isOpen` is true — a dropdown, or a bottom sheet on phones.
const props = defineProps<{
  isOpen: boolean
  /** Element the dropdown opens at, instead of the `toggle` element — such as the field of an input. */
  anchor?: Element | null
  /** Repeats `toggle` at the top of the bottom sheet on phones, with `unclickable` false — and true for the one in place. */
  repeatToggle?: boolean
  /** Opens over the dropdown this one is inside of, instead of taking its place. */
  nested?: boolean
} & Pick<OverlayDropdownOptions, 'align' | 'frameClass' | 'sheetClass' | 'closeOnClick'>>()

const emit = defineEmits<{
  /** The dropdown closed without `isOpen` turning false — a click outside, Escape, a swipe, or another dropdown taking its place. */
  (e: 'close'): void
}>()

defineOptions({inheritAttrs: false})

defineSlots<{
  /** Element that opens the dropdown, which it points at. `unclickable` is set with `repeatToggle` on phones, `isTop` while the dropdown is open above it. */
  toggle?: (props: {unclickable: boolean | undefined, isTop: boolean}) => VNode[]
  /** Content of the dropdown, which brings its own padding. A click inside closes it with `closeOnClick`. */
  content?: () => VNode[]
  /** Heading of the bottom sheet on phones. */
  header?: () => VNode[]
}>()

const slots = useSlots()

const {isMobile} = useIsMobile()

const containerRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('container')

const element = computed(() => props.anchor ?? (containerRef.value instanceof HTMLElement ? containerRef.value : containerRef.value?.$el as HTMLElement | undefined))

// The overlay host renders the slots, as components so they keep this component's context.
const isTop = ref(false)

// The content also reports back where the dropdown opened, which only the layer knows.
// It declares `close:modal`, which the host listens to on every content, as the slot may render several nodes for the listener to fall through to.
const renderContent = markRaw(defineComponent({
  emits: ['close:modal'],
  setup() {
    const value = inject(wOverlayIsTop, undefined)

    watch(() => value?.value ?? false, item => isTop.value = item, {immediate: true})
    onUnmounted(() => isTop.value = false)

    return () => slots.content?.()
  },
}))
const renderHeader = markRaw(() => slots.header?.())
const renderToggle = markRaw(() => slots.toggle?.({unclickable: false, isTop: false}))

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
      align: props.align,
      frameClass: props.frameClass,
      sheetClass: props.sheetClass,
      closeOnClick: props.closeOnClick,
      title: slots.header ? renderHeader : undefined,
      header: props.repeatToggle ? renderToggle : undefined,
    },
    onClose: () => {
      if (closeDropdown !== value) return

      closeDropdown = null

      if (props.isOpen) emit('close')
    },
  })

  closeDropdown = value

  if (!value) emit('close')
}

const close = () => {
  const value = closeDropdown

  closeDropdown = null
  value?.()
}

onMounted(() => {
  watch(() => props.isOpen, value => {
    if (value) open()
    else close()
  }, {immediate: true})
})
</script>
