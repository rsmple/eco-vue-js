<template>
  <div 
    class="
      height-full w-actions-bar
      sm-not:[--actions-bar-filter-width:calc(100vw-var(--w-actions-bar-width))] fixed right-(--right-margin,0px) top-0 grid
      grid-cols-[var(--actions-bar-filter-width-current,0)_var(--w-actions-bar-width)] grid-rows-[var(--header-height)_1fr]
      justify-end overflow-hidden transition-[grid-template-columns]
      duration-300 print:hidden
    "
    :class="{
      '[--actions-bar-filter-width-current:var(--actions-bar-filter-width)]': isOpen && hasFilter,
    }"
    :style="{zIndex: BASE_ZINDEX_ACTIONS_BAR}"
  >
    <div
      class="
        no-scrollbar relative col-start-1 row-span-2 grid grid-cols-(--actions-bar-filter-width)
        justify-self-end overflow-y-auto overflow-x-hidden overscroll-contain
      "
    >

      <div class="pb-16">
        <div class="text-accent px---inner-margin h---header-height flex items-center text-xl font-semibold">
          {{ textFilter ?? 'Filters' }}
        </div>

        <component
          :is="slot"
          v-for="(slot, index) in filter"
          :key="index"
        />
      </div>
    </div>

    <div class="relative row-span-2 grid h-full grid-cols-1 grid-rows-subgrid overflow-x-hidden overscroll-contain">
      <button
        v-if="hasFilter"
        class="w-ripple w-ripple-hover relative row-start-1 flex cursor-pointer select-none items-center justify-center"
        :aria-expanded="isOpen"
        aria-label="Toggle filters"
        @click="toggle"
      >
        <IconBack
          class="text-description square-4 transition-transform"
          :class="{'transform-[rotateY(180deg)]': isOpen}"
        />
      </button>

      <div class="row-start-2 grid grid-rows-[1fr_auto]">
        <div>
          <slot name="top" />

          <div
            v-if="$slots.top && (hasFilter || $slots.bottom)"
            class="mx-1 my-2 h-0.5 rounded bg-gray-200 md:my-4 dark:bg-gray-700"
          />

          <WButtonAction
            v-if="hasFilter"
            :title="textFilter ?? 'Filters'"
            :icon="markRaw(IconFilter)"
            :active="isOpen"
            :count="count"
            :semantic-type="SemanticType.PRIMARY"
            @click="toggle"
          />

          <slot name="bottom" />
        </div>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {type VNode, computed, markRaw, provide, ref, watch} from 'vue'

import WButtonAction from '@/components/Button/WButtonAction.vue'

import IconBack from '@/assets/icons/IconBack.svg?component'
import IconFilter from '@/assets/icons/IconFilter.svg?component'

import {SemanticType} from '@/utils/SemanticType'
import {BASE_ZINDEX_ACTIONS_BAR, wBaseZIndex} from '@/utils/utils'

import {useActionBarFilter} from './use/useActionsBarFilter'

defineProps<{
  /** Title of the filter button and heading of the filter panel. */
  textFilter?: string
}>()

provide(wBaseZIndex, BASE_ZINDEX_ACTIONS_BAR)

const {filter, count} = useActionBarFilter()

const hasFilter = computed(() => filter.value !== undefined)

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

watch(hasFilter, value => {
  if (!value) close()
})

defineSlots<{
  /** WButtonAction buttons at the top, above the filter button. */
  top?: () => VNode[]
  /** WButtonAction buttons under the filter button. */
  bottom?: () => VNode[]
  /** Content at the bottom of the bar, such as settings. */
  footer?: () => VNode[]
}>()
</script>
