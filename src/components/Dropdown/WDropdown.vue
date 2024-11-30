<template>
  <div
    ref="dropdown"
    :style="styles"
    class="group/dropdown fixed h-auto"
    :class="{
      'dropdown-top': isTop,
    }"
  >
    <slot
      :left="styles.left"
      :right="styles.right"
      :istop="isTop"
    />
  </div>
</template>

<script lang="ts" setup>
import type {DropdownProps} from './types'

import {computed, onBeforeMount, onBeforeUnmount, onMounted, ref, toRef, useTemplateRef, watch} from 'vue'

import DOMListenerContainer from '@/utils/DOMListenerContainer'
import {getAllScrollParents, isClientSide} from '@/utils/utils'

import {type HorizontalGetter, VerticalGetter, horizontalGetterOrderMap, searchStyleGetter} from './utils/DropdownStyle'

const props = defineProps<DropdownProps>()

const emit = defineEmits<{
  (e: 'update:rect'): void
}>()

const dropdownRef = useTemplateRef('dropdown')

let parentRect: DOMRect | null = null
let horizontalGetter: HorizontalGetter | null = null
let verticalGetter: VerticalGetter | null = null

const isTop = ref(false)

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

    if (updateSize) widthStyle.value = horizontalGetter.widthStyleGetter(newRect, props.maxWidth)
  }

  if (!verticalGetter || (isTopChanged && (props.updateAlign || updateAlign))) {
    const order = horizontalGetter.verticalGetterOrder

    verticalGetter = searchStyleGetter(order, newRect, props.maxHeight)
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

  domListenerContainer = new DOMListenerContainer(
    [document, window, ...getAllScrollParents(dropdownRef.value)],
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

defineExpose({
  update: () => {
    setParentRect()
  },
})
</script>
