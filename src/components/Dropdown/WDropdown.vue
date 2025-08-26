<template>
  <div
    ref="dropdown"
    :style="{
      '--dropdown-x': x + 'px',
      '--dropdown-y': y + 'px',
    }"
    class="group/dropdown width-0 height-0 fixed left-0 top-0 grid will-change-transform"
    style="
      transform: translate(var(--dropdown-x, 0px), var(--dropdown-y, 0px));
    "
    :class="[
      {
        'dropdown-top': isTop,
      },
      originX,
      originY,
    ]"
  >
    <div
      :style="{
        '--dropdown-width': width !== undefined ? width + 'px' : undefined,
        '--dropdown-height': height !== undefined ? height + 'px' : undefined,
        width: props.horizontalAlign === HorizontalAlign.FILL ? 'var(--dropdown-width)' : 'max-content',
      }"
      style="
        max-width: var(--dropdown-width);
        max-height: var(--dropdown-height);
      "
    >
      <slot
        v-bind="{isTop, isLeft, isRight, x, y, originX, originY}"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {DropdownDefaultSlotScope, DropdownProps} from './types'

import {type VNode, computed, onBeforeMount, onBeforeUnmount, onMounted, ref, toRef, useTemplateRef, watch} from 'vue'

import DOMListenerContainer from '@/utils/DOMListenerContainer'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {getAllScrollParents, isClientSide} from '@/utils/utils'

import {type HorizontalGetter, LeftCenter, LeftInner, LeftOuter, OriginX, OriginY, RightInner, RightOuter, VerticalGetter, horizontalGetterOrderMap, searchStyleGetter} from './utils/DropdownStyle'

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

const x = ref(0)
const y = ref(0)
const width = ref<number | undefined>(0)
const height = ref<number | undefined>(0)
const originX = ref(OriginX.LEFT)
const originY = ref(OriginY.TOP)

const order = computed(() => horizontalGetterOrderMap[props.horizontalAlign])

const setParentRect = (updateSize = false, updateAlign = false): void => {
  const newRect = props.parentElement.getBoundingClientRect()

  const isLeftChanged = newRect.left !== parentRect?.left
  const isTopChanged = newRect.top !== parentRect?.top || newRect.bottom !== parentRect?.bottom

  if (!horizontalGetter || (isLeftChanged && (props.updateAlign || updateAlign))) {
    horizontalGetter = searchStyleGetter(order.value, newRect, props.maxWidth)

    originX.value = horizontalGetter.origin
    isLeftCenter.value = horizontalGetter instanceof LeftCenter
    isLeft.value = horizontalGetter instanceof LeftOuter || horizontalGetter instanceof LeftInner
    isRight.value = horizontalGetter instanceof RightOuter || horizontalGetter instanceof RightInner

    if (updateSize) width.value = horizontalGetter.widthStyleGetter(newRect, props.maxWidth)
  }

  if (!verticalGetter || (isTopChanged && (props.updateAlign || updateAlign))) {
    verticalGetter = props.top
      ? horizontalGetter.verticalGetterOrder[1]
      : props.bottom
        ? horizontalGetter.verticalGetterOrder[0]
        : searchStyleGetter(horizontalGetter.verticalGetterOrder, newRect, props.maxHeight)

    originY.value = verticalGetter.origin
    isTop.value = verticalGetter.isTop

    if (updateSize) height.value = verticalGetter.heightStyleGetter(newRect, props.maxHeight)
  }
  
  if (isLeftChanged) x.value = horizontalGetter.styleGetter(newRect)
  if (isTopChanged) y.value = verticalGetter.styleGetter(newRect)

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
