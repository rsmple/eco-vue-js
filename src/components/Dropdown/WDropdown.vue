<template>
  <div
    ref="dropdown"
    :style="{
      '--w-dropdown-x': x + 'px',
      '--w-dropdown-y': y + 'px',
    }"
    class="group/dropdown square-0 fixed left-0 top-0 grid will-change-transform"
    style="
    transform: translate(var(--dropdown-x, 0px), var(--dropdown-y, 0px));
    --dropdown-x: max(min(var(--w-dropdown-x, 0px), var(--w-dropdown-x-max, 100vw)), var(--w-dropdown-x-min, 0px));
    --dropdown-y: max(min(var(--w-dropdown-y, 0px), var(--w-dropdown-y-max, 100vh)), var(--w-dropdown-y-min, 0px));
    "
    :class="[
      {'dropdown-top': isTop},
      horizontalGetter?.origin,
      verticalGetter?.origin,
    ]"
  >
    <div
      class="relative"
      :class="innerClass ?? 'w-max'"
      :style="[
        verticalGetter?.style,
        horizontalGetter?.style,
        parentRect ? horizontalGetter?.styleGetter?.(parentRect) : undefined,
      ]"
    >
      <slot
        v-bind="{isTop, isLeft, isRight, atBottom}"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {DropdownDefaultSlotScope, DropdownProps} from './types'

import {type VNode, computed, onBeforeMount, onMounted, onUnmounted, ref, toRef, useTemplateRef, watch} from 'vue'

import {DOMListenerContainer} from '@/utils/DOMListenerContainer'
import {getAllScrollParents, getAnchorNode, getIsClientSide, isAnchorConnected} from '@/utils/utils'

import {type HorizontalGetter, OriginX, type VerticalGetter, horizontalGetterOrderMap, searchStyleGetter} from './utils/DropdownStyle'

const props = defineProps<DropdownProps>()

const emit = defineEmits<{
  /** The page scrolled or resized while `emitUpdate` is set, e.g. to close the dropdown. */
  (e: 'update:rect'): void
}>()

const dropdownRef = useTemplateRef('dropdown')

const parentRect = ref<DOMRect | null>(null)
const horizontalGetter = ref<HorizontalGetter | null>(null)
const verticalGetter = ref<VerticalGetter | null>(null)

const isTop = computed(() => verticalGetter.value?.isTop === true)
const isLeft = computed(() => horizontalGetter.value?.origin === OriginX.RIGHT)
const isRight = computed(() => horizontalGetter.value?.origin === OriginX.LEFT)

const x = ref(0)
const y = ref(0)

const atBottom = computed(() => y.value > window.innerHeight / 2)

const order = computed(() => horizontalGetterOrderMap[props.horizontalAlign])

const setParentRect = (updateAlign = false): void => {
  // A parent taken off the page reads as an empty rect in the corner, so the dropdown stays where it was.
  if (parentRect.value && (props.freeze || !isAnchorConnected(props.parentElement))) return

  const newRect = props.parentElement.getBoundingClientRect()

  const isLeftChanged = newRect.left !== parentRect.value?.left || newRect.right !== parentRect.value?.right
  const isTopChanged = newRect.top !== parentRect.value?.top || newRect.bottom !== parentRect.value?.bottom

  if (!horizontalGetter.value || (isLeftChanged && (props.updateAlign || updateAlign))) {
    horizontalGetter.value = searchStyleGetter(order.value, newRect)
  }

  if (!verticalGetter.value || (isTopChanged && (props.updateAlign || updateAlign))) {
    verticalGetter.value = props.top && horizontalGetter.value.verticalGetterOrder[1]
      ? horizontalGetter.value.verticalGetterOrder[1]
      : props.bottom
        ? horizontalGetter.value.verticalGetterOrder[0]
        : searchStyleGetter(horizontalGetter.value!.verticalGetterOrder, newRect)
  }

  if (isLeftChanged) x.value = horizontalGetter.value.x(newRect)
  if (isTopChanged) y.value = verticalGetter.value.y(newRect)

  if (isLeftChanged || isTopChanged) parentRect.value = newRect
}

onBeforeMount(() => {
  setParentRect(true)
})

let domListenerContainer: DOMListenerContainer
let resizeObserver: ResizeObserver | undefined
let requestAnimationFrameId: number | null = null

onMounted(() => {
  if (!getIsClientSide() || !dropdownRef.value) return

  const parent = getAnchorNode(props.parentElement)

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
    {passive: true},
  )

  // A parent that changes size, such as a field as its chips wrap, moves the edges the dropdown sits at.
  if (props.parentElement instanceof Element && !props.emitUpdate) {
    resizeObserver = new ResizeObserver(() => setParentRect())
    resizeObserver.observe(props.parentElement)
  }
})

onUnmounted(() => {
  domListenerContainer?.destroy()
  resizeObserver?.disconnect()
})

watch(toRef(props, 'parentElement'), () => {
  setParentRect(true)
})

defineSlots<{
  /** Content of the dropdown. `isTop` is true when it opened above the parent, `isLeft` and `isRight` when it opened to that side, and `atBottom` when the parent is in the lower half of the screen. */
  default: (props: DropdownDefaultSlotScope) => VNode[]
}>()

defineExpose({
  /** Whether it opened above the parent. */
  isTop,
  update: () => {
    setParentRect()
  },
})
</script>
