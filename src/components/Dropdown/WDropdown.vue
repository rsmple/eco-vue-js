<template>
  <div
    ref="dropdown"
    :style="styles"
    class="group/dropdown fixed grid h-auto"
    :class="{
      'dropdown-top': isTop,
      'content-center': horizontalAlign === HorizontalAlign.LEFT_CENTER || horizontalAlign === HorizontalAlign.RIGHT_CENTER,
      'justify-end': isLeftCenter,
      'justify-center': horizontalAlign === HorizontalAlign.CENTER,
    }"
  >
    <slot
      v-bind="{isTop, isLeft, isRight}"
      :left="styles.left"
      :right="styles.right"
      :top="styles.top"
      :bottom="styles.bottom"
    />
  </div>
</template>

<script lang="ts" setup>
import type {DropdownDefaultSlotScope, DropdownProps} from './types'

import {type VNode, computed, onBeforeMount, onBeforeUnmount, onMounted, ref, toRef, useTemplateRef, watch} from 'vue'

import DOMListenerContainer from '@/utils/DOMListenerContainer'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {getAllScrollParents, isClientSide} from '@/utils/utils'

import {type HorizontalGetter, LeftCenter, LeftInner, LeftOuter, RightInner, RightOuter, VerticalGetter, horizontalGetterOrderMap, searchStyleGetter} from './utils/DropdownStyle'

const props = defineProps<DropdownProps>()

const emit = defineEmits<{
  (e: 'update:rect'): void
}>()

const dropdownRef = useTemplateRef('dropdown')

let parentRect: DOMRect | null = null
let horizontalGetter: HorizontalGetter | null = null
let verticalGetter: VerticalGetter | null = null

const isTop = ref(false)
const isLeftCenter = ref(false)
const isLeft = ref(false)
const isRight = ref(false)

const widthStyle = ref<Record<string, string>>({})
const heightStyle = ref<Record<string, string>>({})
const horizontalStyle = ref<Record<string, string>>({})
const verticalStyle = ref<Record<string, string>>({})

const order = computed(() => horizontalGetterOrderMap[props.horizontalAlign])

const styles = computed(() => {
  return {
    ...widthStyle.value,
    ...heightStyle.value,
    ...horizontalStyle.value,
    ...verticalStyle.value,
  }
})

const setParentRect = (updateSize = false, updateAlign = false): void => {
  const newRect = props.parentElement.getBoundingClientRect()

  const isLeftChanged = newRect.left !== parentRect?.left
  const isTopChanged = newRect.top !== parentRect?.top || newRect.bottom !== parentRect?.bottom

  if (!horizontalGetter || (isLeftChanged && (props.updateAlign || updateAlign))) {
    horizontalGetter = searchStyleGetter(order.value, newRect, props.maxWidth)

    isLeftCenter.value = horizontalGetter instanceof LeftCenter
    isLeft.value = horizontalGetter instanceof LeftOuter || horizontalGetter instanceof LeftInner
    isRight.value = horizontalGetter instanceof RightOuter || horizontalGetter instanceof RightInner

    if (updateSize) widthStyle.value = horizontalGetter.widthStyleGetter(newRect, props.maxWidth)
  }

  if (!verticalGetter || (isTopChanged && (props.updateAlign || updateAlign))) {
    verticalGetter = props.top
      ? horizontalGetter.verticalGetterOrder[1]
      : props.bottom
        ? horizontalGetter.verticalGetterOrder[0]
        : searchStyleGetter(horizontalGetter.verticalGetterOrder, newRect, props.maxHeight)
    isTop.value = verticalGetter.isTop

    if (updateSize) heightStyle.value = verticalGetter.heightStyleGetter(newRect, props.maxHeight)
  }

  if (isLeftChanged) horizontalStyle.value = horizontalGetter.styleGetter(newRect)
  if (isTopChanged) verticalStyle.value = verticalGetter.styleGetter(newRect)

  if (isLeftChanged || isTopChanged) parentRect = newRect
}

onBeforeMount(() => {
  setParentRect(true)
})

let domListenerContainer: DOMListenerContainer
let requestAnimationFrameId: number | null = null

onMounted(() => {
  if (!isClientSide || !dropdownRef.value) return

  const parent = props.parentElement instanceof Element
    ? props.parentElement
    : props.parentElement instanceof Range
      ? props.parentElement.commonAncestorContainer
      : undefined

  domListenerContainer = new DOMListenerContainer(
    parent
      ? [document, window, ...getAllScrollParents(parent)]
      : [document, window],
    ['scroll', 'touchmove', 'resize'],
    () => {
      if (requestAnimationFrameId) window.cancelAnimationFrame(requestAnimationFrameId)

      if (props.emitUpdate) {
        emit('update:rect')

        return
      }

      requestAnimationFrameId = requestAnimationFrame(() => {
        setParentRect()
      })
    },
  )
})

onBeforeUnmount(() => {
  domListenerContainer.destroy()
})

watch(toRef(props, 'parentElement'), () => {
  setParentRect(false, true)
})

defineSlots<{
  default: (props: DropdownDefaultSlotScope) => VNode[]
}>()

defineExpose({
  update: () => {
    setParentRect()
  },
})
</script>
