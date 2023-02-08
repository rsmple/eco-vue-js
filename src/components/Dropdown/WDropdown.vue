<template>
  <div
    ref="dropdown"
    :style="styles"
    class="fixed h-auto z-[2] group/dropdown"
    :class="{
      'dropdown-top': isTop,
      'w-0 flex justify-center': horizontalAlign === HorizontalAlign.CENTER,
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, onBeforeUnmount, onMounted, ref} from 'vue'
import DOMListenerContainer from '@/utils/DOMListenerContainer'
import {getAllScrollParents} from '@/utils/utils'
import {horizontalGetterOrderMap, searchStyleGetter, VerticalGetter, type HorizontalGetter} from './utils/DropdownStyle'
import {HorizontalAlign} from '@/utils/HorizontalAlign'

const props = defineProps<{
  maxHeight: number
  maxWidth: number
  horizontalAlign: HorizontalAlign
  parentElement: Element
  updateAlign?: boolean
  emitUpdate?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:rect'): void
}>()

const dropdown = ref<HTMLDivElement>()

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

const setParentRect = (updateSize = false): void => {
  const newRect = props.parentElement.getBoundingClientRect()

  const isLeftChanged = newRect.left !== parentRect?.left
  const isTopChanged = newRect.top !== parentRect?.top || newRect.bottom !== parentRect?.bottom

  if (!horizontalGetter || (isLeftChanged && props.updateAlign)) {
    horizontalGetter = searchStyleGetter(order.value, newRect, props.maxWidth)

    if (updateSize) widthStyle.value = horizontalGetter.widthStyleGetter(newRect, props.maxWidth)
  }

  if (!verticalGetter || (isTopChanged && props.updateAlign)) {
    const order = horizontalGetter.verticalGetterOrder

    verticalGetter = searchStyleGetter(order, newRect, props.maxHeight)
    isTop.value = verticalGetter.isTop

    if (updateSize) heightStyle.value = verticalGetter.heightStyleGetter(newRect, props.maxHeight)
  }

  if (isLeftChanged) horizontalStyle.value = horizontalGetter.styleGetter(newRect)
  if (isTopChanged) verticalStyle.value = verticalGetter.styleGetter(newRect)

  if (isTopChanged || isTopChanged) parentRect = newRect
}

onBeforeMount(() => {
  setParentRect()
})

let domListenerContainer: DOMListenerContainer
let requestAnimationFrameId: number | null = null

onMounted(() => {
  domListenerContainer = new DOMListenerContainer(
    [document, window, ...getAllScrollParents(dropdown.value)],
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

defineExpose({
  update: () => {
    setParentRect()
  },
})

</script>
