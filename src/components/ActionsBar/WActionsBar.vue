<template>
  <div 
    class="
      height-full bg-default dark:bg-default-dark sm-not:[--actions-bar-filter-width:calc(100vw-var(--actions-bar-width))] fixed right-0 top-0 z-40 grid grid-rows-[3.75rem,1fr] justify-end
      overflow-hidden shadow-md transition-[grid-template-columns] duration-300 [--actions-toggle-height:4rem]
      print:hidden
    "
    :class="{
      'grid-cols-[0,var(--actions-bar-width)]': !isOpen || !hasFilter,
      'grid-cols-[var(--actions-bar-filter-width,24rem),var(--actions-bar-width,4rem)]': isOpen && hasFilter,
    }"
  >
    <div
      class="
        no-scrollbar relative col-span-1 row-span-2 grid grid-cols-[var(--actions-bar-filter-width,24rem)]
        grid-rows-subgrid justify-self-end overflow-y-auto overflow-x-hidden overscroll-contain
      "
    >
      <div class="-px--inner-margin col-span-1 row-span-2 grid grid-rows-subgrid">
        <div class="text-accent flex items-center text-2xl font-semibold">
          Filters
        </div>

        <component
          :is="$slots.filter?.()?.[0]"
          @update:count="filterCount = $event"
        />
      </div>
    </div>

    <div class="relative row-span-2 grid h-full grid-cols-1 grid-rows-subgrid overflow-x-hidden overscroll-contain">
      <div
        v-if="hasFilter"
        class="w-ripple relative row-start-1 flex cursor-pointer select-none items-center justify-center"
        @click="toggle"
      >
        <IconBack
          class="text-description square-5 transition-transform"
          :class="{'[transform:rotateY(180deg)]': isOpen}"
        />
      </div>

      <div class="row-start-2">
        <slot name="top" />

        <div
          v-if="hasTop && (hasFilter || hasBottom)"
          class="mx-1 my-4 h-0.5 rounded bg-gray-400 md:my-8"
        />

        <WButtonAction
          v-if="hasFilter"
          title="Filters"
          :icon="IconFilter"
          :active="isOpen"
          :count="filterCount"
          @click="toggle"
        />

        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onUnmounted, ref, useSlots, watch} from 'vue'

import WButtonAction from '@/components/Button/WButtonAction.vue'

import IconBack from '@/assets/icons/default/IconBack.svg?component'
import IconFilter from '@/assets/icons/sax/IconFilter.svg?component'

let closeModal: (() => void) | null = null

const isOpen = ref(false)
const filterCount = ref(0)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const slots = useSlots()

const hasTop = computed(() => !!slots.top?.()?.length)
const hasFilter = computed(() => !!slots.filter?.()?.length)
const hasBottom = computed(() => !!slots.bottom?.()?.length)

onUnmounted(() => {
  closeModal?.()

  closeModal = null
})

watch(hasFilter, value => {
  if (!value) close()
})
</script>
