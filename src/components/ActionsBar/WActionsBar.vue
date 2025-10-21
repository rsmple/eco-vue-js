<template>
  <div 
    class="
      height-full w-actions-bar
      sm-not:[--actions-bar-filter-width:calc(100vw-var(--w-actions-bar-width))] fixed right-0 top-0 grid
      grid-cols-[var(--actions-bar-filter-width-current,0),var(--w-actions-bar-width)] grid-rows-[var(--header-height),1fr]
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
        no-scrollbar relative col-start-1 row-span-2 grid grid-cols-[--actions-bar-filter-width]
        justify-self-end overflow-y-auto overflow-x-hidden overscroll-contain
      "
    >

      <div class="pb-16">
        <div class="text-accent -px--inner-margin -h--header-height flex items-center text-xl font-semibold">
          Filters
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
          :class="{'[transform:rotateY(180deg)]': isOpen}"
        />
      </button>

      <div class="row-start-2 grid grid-rows-[1fr,auto]">
        <div>
          <slot name="top" />

          <div
            v-if="$slots.top && (hasFilter || bottom || $slots.bottom)"
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

          <slot name="bottom">
            <component
              :is="bottom"
              v-if="bottom"
            />
          </slot>
        </div>

        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {type Component, type VNode, computed, markRaw, onUnmounted, provide, ref, watch} from 'vue'

import WButtonAction from '@/components/Button/WButtonAction.vue'

import IconBack from '@/assets/icons/IconBack.svg?component'
import IconFilter from '@/assets/icons/IconFilter.svg?component'

import {SemanticType} from '@/utils/SemanticType'
import {BASE_ZINDEX_ACTIONS_BAR, wBaseZIndex} from '@/utils/utils'

import {useActionBarFilter} from './use/useActionsBarFilter'

defineProps<{
  bottom?: Component
  textFilter?: string
}>()

provide(wBaseZIndex, BASE_ZINDEX_ACTIONS_BAR)

let closeModal: (() => void) | null = null

const {filter, count} = useActionBarFilter()

const hasFilter = computed(() => filter.value !== undefined)

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

onUnmounted(() => {
  closeModal?.()

  closeModal = null
})

watch(hasFilter, value => {
  if (!value) close()
})

defineSlots<{
  top?: () => VNode[]
  bottom?: () => VNode[]
  footer?: () => VNode[]
}>()
</script>
