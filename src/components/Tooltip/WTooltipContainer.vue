<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <WDropdown
      v-if="tooltipMeta"
      :parent-element="tooltipMeta.parent"
      :horizontal-align="HorizontalAlign.CENTER"
      :max-height="120"
      :max-width="240"
      emit-update
      class="z-[10000] [--arrow-size:8px] transition-[top,bottom,left,right]"
      @update:rect="close"
    >
      <template #default="{left, right, istop}">
        <div
          ref="container"
          class="flex justify-center items-center flex-col drop-shadow-md dark:drop-shadow-none pointer-events-none"
        >
          <div
            class="
              w-[calc(var(--arrow-size)/2)] z-10 pointer-events-auto
              border-[transparent] border-solid [border-width:var(--arrow-size)]
            "
            :class="{
              'text-black-default dark:text-gray-800': !tooltipMeta.light,
              'text-default dark:text-gray-800': tooltipMeta.light,
              'border-t-current order-2': istop,
              'border-b-current': !istop,
            }"
            @mouseover="setTooltipMeta(tooltipMeta)"
            @mouseleave="setTooltipMeta(null)"
          />

          <div
            class="py-3 px-4 rounded-xl text-xs font-medium text-center transition-[margin] pointer-events-auto"
            :class="{
              'bg-black-default dark:bg-gray-800 text-default': !tooltipMeta.light,
              'bg-default dark:bg-gray-800 text-accent': tooltipMeta.light,
            }"
            :style="getMarginStylesCached(left, right)"
            @mouseover="setTooltipMeta(tooltipMeta)"
            @mouseleave="setTooltipMeta(null)"
          >
            <template v-if="tooltipMeta.slot">
              <component
                :is="tooltipMeta.slot"
                :key="tooltipMeta.key"
              />
            </template>

            <div
              v-else-if="tooltipMeta.text"
              class="whitespace-nowrap"
            >
              {{ tooltipMeta.text }}
            </div>
          </div>
        </div>
      </template>
    </WDropdown>
  </Transition>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, onBeforeMount, onBeforeUnmount} from 'vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {initTooltip, type SetTooltipMeta, type TooltipMeta} from '@/utils/Tooltip'

const MARGIN = 12

const tooltipMeta = ref<TooltipMeta | null>(null)
const container = ref<HTMLDivElement | undefined>()
const containerWidth = ref<number>(0)
let timeout: NodeJS.Timeout | undefined

const setTooltipMeta: SetTooltipMeta = (meta: TooltipMeta | null) => {
  clearTimeoutOnClose()

  if (!meta) {
    timeout = setTimeout(() => {
      tooltipMeta.value = null
      timeout = undefined
    }, 100)
  } else if (tooltipMeta.value !== meta) {
    timeout = setTimeout(() => {
      tooltipMeta.value = meta
      updateContainerStyles(container.value)
    }, 25)
  }
}

const close = () => {
  clearTimeoutOnClose()

  tooltipMeta.value = null
}

const clearTimeoutOnClose = () => {
  if (!timeout) return

  clearTimeout(timeout)
  timeout = undefined
}

const updateContainerStyles = (value: HTMLDivElement | undefined) => {
  if (!value) {
    containerWidth.value = 0
  } else {
    containerWidth.value = value.getBoundingClientRect().width
  }
}

const getMarginStyles = (left?: string, right?: string) => {
  if (!containerWidth.value) return

  const l = left ? Number.parseFloat(left.substring(0, left.indexOf('px'))) : undefined

  if (l !== undefined) {
    const containerLeft = l - (containerWidth.value / 2) - MARGIN

    if (containerLeft < 0) return {marginLeft: (0 - containerLeft) + 'px', marginRight: containerLeft + 'px'}

    const containerRight = window.innerWidth - l - (containerWidth.value / 2) - MARGIN

    if (containerRight < 0) return {marginRight: (0 - containerRight) + 'px', marginLeft: containerRight + 'px'}

    return {}
  }

  const r = right ? Number.parseFloat(right.substring(0, right.indexOf('px'))) : undefined
  
  if (r !== undefined) {
    const containerLeft = window.innerWidth - r - (containerWidth.value / 2) - MARGIN

    if (containerLeft < 0) return {marginLeft: (0 - containerLeft) + 'px', marginRight: containerLeft + 'px'}

    const containerRight = r - (containerWidth.value / 2) - MARGIN

    if (containerRight < 0) return {marginRight: (0 - containerRight) + 'px', marginLeft: containerRight + 'px'}

    return {}
  }
}

const marginStyleCache = ref()

const getMarginStylesCached = (left?: string, right?: string) => {
  const styles = getMarginStyles(left, right)

  if (!styles) return marginStyleCache.value

  marginStyleCache.value = styles

  return styles
}

onBeforeMount(() => {
  initTooltip(setTooltipMeta)
})

onMounted(() => {
  window.addEventListener('touch', close)
})

onBeforeUnmount(() => {
  initTooltip(undefined)
})

onUnmounted(() => {
  window.removeEventListener('touch', close)
})

</script>
