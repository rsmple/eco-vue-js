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
      :horizontal-align="tooltipMeta.left ? HorizontalAlign.LEFT_OUTER : tooltipMeta.right ? HorizontalAlign.RIGHT_OUTER : HorizontalAlign.CENTER"
      :max-height="tooltipMeta?.maxHeight ?? 120"
      :max-width="240"
      emit-update
      class="isolate z-[10000]"
      @update:rect="close"
    >
      <template #default="{left, right, top, bottom, isTop}">
        <TooltipContainer
          :tooltip-meta="tooltipMeta"
          :left="left"
          :right="right"
          :top="top"
          :bottom="bottom"
          :is-top="isTop"
          :is-left="tooltipMeta.left"
          :is-right="tooltipMeta.right"
          @over="setTooltipMeta(tooltipMeta)"
          @leave="setTooltipMeta(null)"
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
        </TooltipContainer>
      </template>
    </WDropdown>
  </Transition>
</template>

<script lang="ts" setup>
import {markRaw, onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, ref} from 'vue'

import WDropdown from '@/components/Dropdown/WDropdown.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {type SetTooltipMeta, type TooltipMeta, initTooltip} from '@/utils/Tooltip'

import TooltipContainer from './components/TooltipContainer.vue'

const tooltipMeta = ref<TooltipMeta | null>(null)
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
      tooltipMeta.value = markRaw(meta)
      timeout = undefined
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
