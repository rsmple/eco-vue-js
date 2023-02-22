<template>
  <Transition
    enter-active-class="fade-enter-active"
    leave-active-class="fade-leave-active"
    enter-from-class="fade-enter-from"
    leave-to-class="fade-leave-to"
  >
    <WDropdown
      v-if="tooltipMeta"
      :parent-element="tooltipMeta.parent"
      :horizontal-align="HorizontalAlign.CENTER"
      :max-height="120"
      :max-width="240"
      emit-update
      class="z-[10000] [--arrow-size:8px]"
      @update:rect="close"
    >
      <div
        class="min-w-[15rem] flex justify-center items-center flex-col drop-shadow-md dark:drop-shadow-none"
        @mouseover="setTooltipMeta(tooltipMeta)"
        @mouseleave="close()"
      >
        <div
          class="
              w-[calc(var(--arrow-size)/2)] z-10
              border-[transparent] border-solid [border-width:var(--arrow-size)] group-[.dropdown-top]/dropdown:order-2
            "
          :class="{
            'group-[.dropdown-top]/dropdown:border-t-black-default dark:group-[.dropdown-top]/dropdown:border-t-gray-800 group-[:not(.dropdown-top)]/dropdown:border-b-black-default dark:group-[:not(.dropdown-top)]/dropdown:border-b-gray-800': !tooltipMeta.light,
            'group-[.dropdown-top]/dropdown:border-t-default dark:group-[.dropdown-top]/dropdown:border-t-gray-800 group-[:not(.dropdown-top)]/dropdown:border-b-default dark:group-[:not(.dropdown-top)]/dropdown:border-b-gray-800': tooltipMeta.light,
          }"
        />

        <div
          ref="container"
          class="py-3 px-4 rounded-xl text-xs font-medium text-center"
          :class="{
            'bg-black-default dark:bg-gray-800 text-default': !tooltipMeta.light,
            'bg-default dark:bg-gray-800 text-accent': tooltipMeta.light,
          }"
          :style="containerStyles"
        >
          <template v-if="tooltipMeta.slot">
            <component :is="tooltipMeta.slot" />
          </template>

          <template v-else-if="tooltipMeta.text">
            {{ tooltipMeta.text }}
          </template>
        </div>
      </div>
    </WDropdown>
  </Transition>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref, type CSSProperties, watch, onBeforeMount, onBeforeUnmount} from 'vue'
import WDropdown from '@/components/Dropdown/WDropdown.vue'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {initTooltip, type SetTooltipMeta, type TooltipMeta} from '@/utils/Tooltip'

const MARGIN = 48

const tooltipMeta = ref<TooltipMeta | null>(null)
const container = ref<HTMLDivElement | undefined>()
const containerStyles = ref<CSSProperties | undefined>()
let timeout: NodeJS.Timeout | undefined

const setTooltipMeta: SetTooltipMeta = (meta: TooltipMeta | null) => {
  clearTimeoutOnClose()

  if (!meta) {
    timeout = setTimeout(() => {
      tooltipMeta.value = null
      timeout = undefined
    }, 100)
  } else {
    tooltipMeta.value = meta
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

watch(container, value => {
  if (!value) {
    containerStyles.value = undefined
    return
  }

  const rect = value.getBoundingClientRect()

  if (rect.left < MARGIN) {
    containerStyles.value = {
      marginLeft: (MARGIN - rect.left) + 'px',
    }
    return
  }

  const right = window.innerWidth - rect.right

  if (right < MARGIN) {
    containerStyles.value = {
      marginRight: (MARGIN - right) + 'px',
    }
    return
  }

  containerStyles.value = undefined
})

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
