<template>
  <div 
    class="
      height-full bg-default dark:bg-default-dark
      sm-not:[--actions-bar-filter-width:calc(100vw-var(--w-actions-bar-width))] fixed right-0 top-0 z-40 grid
      grid-cols-[var(--actions-bar-filter-width-current,0),var(--w-actions-bar-width)] grid-rows-[var(--header-height),1fr]
      justify-end overflow-hidden shadow-md transition-[grid-template-columns]
      duration-300 print:hidden
    "
    :class="{
      '[--actions-bar-filter-width-current:var(--actions-bar-filter-width)]': isOpen && hasFilter,
    }"
  >
    <div
      class="
        no-scrollbar relative col-start-1 row-span-2 grid grid-cols-[--actions-bar-filter-width]
        justify-self-end overflow-y-auto overflow-x-hidden overscroll-contain
      "
    >
      <component
        :is="filter"
        v-if="filter"
        @update:count="updateCount"
      />
    </div>

    <div class="relative row-span-2 grid h-full grid-cols-1 grid-rows-subgrid overflow-x-hidden overscroll-contain">
      <button
        v-if="hasFilter"
        class="w-ripple w-ripple-hover relative row-start-1 flex cursor-pointer select-none items-center justify-center"
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
            title="Filters"
            :icon="markRaw(IconFilter)"
            :active="isOpen"
            :count="filterCount"
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
import {type Component, type VNode, computed, markRaw, onUnmounted, ref, watch} from 'vue'

import WButtonAction from '@/components/Button/WButtonAction.vue'

import IconBack from '@/assets/icons/default/IconBack.svg?component'
import IconFilter from '@/assets/icons/sax/IconFilter.svg?component'

import {SemanticType} from '@/main'

const props = defineProps<{
  filter?: Component
  bottom?: Component
}>()

let closeModal: (() => void) | null = null

const isOpen = ref(false)
const filterCount = ref(0)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const hasFilter = computed(() => !!props.filter)

const updateCount = (value: number): void => {
  filterCount.value = value
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
