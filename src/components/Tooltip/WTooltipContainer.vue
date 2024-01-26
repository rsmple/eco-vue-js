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
      :max-height="tooltipMeta?.maxHeight ?? 120"
      :max-width="240"
      emit-update
      class="z-[10000] sm:transition-[top,bottom,left,right] will-change-[top,bottom,left,right] isolate"
      @update:rect="close"
    >
      <template #default="{left, right, istop}">
        <TooltipContainer
          :tooltip-meta="tooltipMeta"
          :left="left"
          :right="right"
          :is-top="istop"
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
import {onMounted, onUnmounted, ref, onBeforeMount, onBeforeUnmount, markRaw} from 'vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {initTooltip, type SetTooltipMeta, type TooltipMeta} from '@/utils/Tooltip'
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
