<template>
  <div
    ref="dropdown"
    :style="{
      '--w-dropdown-x': x + 'px',
      '--w-dropdown-y': y + 'px',
    }"
    class="group/dropdown width-0 height-0 fixed left-0 top-0 grid will-change-transform"
    style="
    transform: translate(var(--dropdown-x, 0px), var(--dropdown-y, 0px));
    --dropdown-x: calc(max(min(var(--w-dropdown-x, 0px), var(--w-dropdown-x-max, 100vw)), var(--w-dropdown-x-min, 0px)));
    --dropdown-y: calc(max(min(var(--w-dropdown-y, 0px), var(--w-dropdown-y-max, 100vh)), var(--w-dropdown-y-min, 0px)));
    "
    :class="[
      {'dropdown-top': isTop},
      horizontalGetter?.origin,
      verticalGetter?.origin,
    ]"
  >
    <div
      class="relative w-max"
      :style="[
        verticalGetter?.style,
        horizontalGetter?.style,
        parentRect ? horizontalGetter?.styleGetter?.(parentRect) : undefined,
      ]"
    >
      <slot
        v-bind="{isTop, isLeft, isRight}"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {DropdownDefaultSlotScope, DropdownProps} from './types'

import {type VNode, computed, onBeforeMount, onMounted, onUnmounted, ref, toRef, useTemplateRef, watch} from 'vue'

import {DOMListenerContainer} from '@/utils/DOMListenerContainer'
import {getAllScrollParents, getIsClientSide} from '@/utils/utils'

import {type HorizontalGetter, OriginX, type VerticalGetter, horizontalGetterOrderMap, searchStyleGetter} from './utils/DropdownStyle'

const props = defineProps<DropdownProps>()

const emit = defineEmits<{
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

const order = computed(() => horizontalGetterOrderMap[props.horizontalAlign])

const setParentRect = (updateAlign = false): void => {
  const newRect = props.parentElement.getBoundingClientRect()

  const isLeftChanged = newRect.left !== parentRect.value?.left
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
let requestAnimationFrameId: number | null = null

onMounted(() => {
  if (!getIsClientSide() || !dropdownRef.value) return

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

onUnmounted(() => {
  domListenerContainer?.destroy()
})

watch(toRef(props, 'parentElement'), () => {
  setParentRect(true)
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
