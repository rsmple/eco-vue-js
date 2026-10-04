<template>
  <component
    :is="unwrapSlots($slots.toggle?.() ?? [])[0]"
    ref="container"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import {type VNode, computed, markRaw, onMounted, useSlots, useTemplateRef, watch} from 'vue'

import {type OverlayDropdownOptions, useOverlay} from '@/utils/Overlay'
import {unwrapSlots} from '@/utils/utils'

// Opens the `content` slot with the overlay manager at the `toggle` element while `isOpen` is true — a dropdown with a tip, or a bottom sheet on phones.
const props = defineProps<{
  isOpen: boolean
} & Pick<OverlayDropdownOptions, 'frameClass' | 'sheetClass' | 'closeOnClick'>>()

const emit = defineEmits<{
  /** The dropdown closed without `isOpen` turning false — a click outside, Escape, a swipe, or another dropdown taking its place. */
  (e: 'close'): void
}>()

defineOptions({inheritAttrs: false})

defineSlots<{
  /** Element that opens the dropdown, which it points at. */
  toggle?: () => VNode[]
  /** Content of the dropdown, which brings its own padding. A click inside closes it with `closeOnClick`. */
  content?: () => VNode[]
  /** Heading of the bottom sheet on phones. */
  header?: () => VNode[]
}>()

const slots = useSlots()

const containerRef = useTemplateRef<ComponentInstance<unknown> | HTMLElement>('container')

const element = computed(() => containerRef.value instanceof HTMLElement ? containerRef.value : containerRef.value?.$el as HTMLElement | undefined)

// The overlay host renders the slots, as components so they keep this component's context.
const renderContent = markRaw(() => slots.content?.())
const renderHeader = markRaw(() => slots.header?.())

const overlay = useOverlay()

let closeDropdown: (() => void) | null = null

const open = () => {
  if (!element.value) return

  const value: (() => void) | null = overlay.open({
    present: 'dropdown',
    anchor: element.value,
    content: renderContent,
    dropdown: {
      frameClass: props.frameClass,
      sheetClass: props.sheetClass,
      closeOnClick: props.closeOnClick,
      title: slots.header ? renderHeader : undefined,
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
