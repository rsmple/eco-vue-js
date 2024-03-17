<template>
  <div 
    class="
      fixed top-0 right-0 height-full z-40 grid bg-default dark:bg-default-dark shadow-md [--actions-toggle-height:4rem] print:hidden
      transition-[grid-template-columns] grid-rows-[3.75rem,1fr] justify-end duration-300 overflow-hidden
      sm-not:[--actions-bar-filter-width:calc(100vw-var(--actions-bar-width))]
    "
    :class="{
      'grid-cols-[0,var(--actions-bar-width)]': !isOpen || !hasFilter,
      'grid-cols-[var(--actions-bar-filter-width,24rem),var(--actions-bar-width,4rem)]': isOpen && hasFilter,
    }"
  >
    <div
      class="
        relative no-scrollbar overflow-x-hidden overflow-y-auto overscroll-contain justify-self-end
        row-span-2 grid grid-cols-[var(--actions-bar-filter-width,24rem)] col-span-1 grid-rows-subgrid
      "
    >
      <div class="row-span-2 grid col-span-1 grid-rows-subgrid -px--inner-margin">
        <div class="text-accent text-2xl font-semibold flex items-center">
          Filters
        </div>

        <component
          :is="$slots.filter?.()?.[0]"
          @update:count="filterCount = $event"
        />
      </div>
    </div>

    <div class="h-full overflow-x-hidden overscroll-contain relative grid grid-cols-1 grid-rows-subgrid row-span-2">
      <div
        v-if="hasFilter"
        class="row-start-1 relative w-ripple flex select-none cursor-pointer justify-center items-center"
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
          class="h-0.5 bg-gray-400 rounded my-4 md:my-8 mx-1"
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
import {ref, onUnmounted, watch, computed, useSlots} from 'vue'
import IconBack from '@/assets/icons/default/IconBack.svg?component'
import WButtonAction from '@/components/Button/WButtonAction.vue'
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
