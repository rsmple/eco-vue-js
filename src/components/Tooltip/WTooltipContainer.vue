<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <WDropdown
      v-if="tooltipMeta"
      ref="dropdown"
      :key="dropdownKey"
      :parent-element="tooltipMeta.parent"
      :horizontal-align="tooltipMeta.left ? HorizontalAlign.LEFT_CENTER : tooltipMeta.right ? HorizontalAlign.RIGHT_CENTER : HorizontalAlign.CENTER"
      :max-height="tooltipMeta?.maxHeight ?? 120"
      :max-width="tooltipMeta.left || tooltipMeta.right ? 400 : 240"
      :top="tooltipMeta.top"
      :bottom="tooltipMeta.bottom"
      emit-update
      class="isolate z-[10000]"
      @update:rect="close"
    >
      <template #default="{isTop, x, y, originX, originY}">
        <TooltipContainer
          :tooltip-meta="tooltipMeta"
          :x="x"
          :y="y"
          :origin-x="originX"
          :origin-y="originY"
          :is-top="isTop"
          :is-left="tooltipMeta.left"
          :is-right="tooltipMeta.right"
          @over="setTooltipMeta(tooltipMeta)"
          @leave="setTooltipMeta(null)"
        >
          <template v-if="tooltipMeta.slot">
            <component
              :is="tooltipMeta.slot"
              :key="tooltipMeta.id"
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
import {computed, onMounted, onUnmounted, useTemplateRef, watch} from 'vue'

import WDropdown from '@/components/Dropdown/WDropdown.vue'

import {HorizontalAlign} from '@/utils/HorizontalAlign'

import TooltipContainer from './components/TooltipContainer.vue'
import {useTooltipMeta} from './models/tooltipMeta'

const {tooltipMeta, setTooltipMeta, close} = useTooltipMeta()

const dropdownRef = useTemplateRef('dropdown')

const dropdownKey = computed(() => tooltipMeta.value?.left ? HorizontalAlign.LEFT_OUTER : tooltipMeta.value?.right ? HorizontalAlign.RIGHT_OUTER : HorizontalAlign.CENTER)

watch(tooltipMeta, (newValue, oldValue) => {
  if (newValue && oldValue && newValue.parent === oldValue.parent) dropdownRef.value?.update()
})

onMounted(() => {
  window.addEventListener('touch', close)
})

onUnmounted(() => {
  window.removeEventListener('touch', close)
})
</script>
