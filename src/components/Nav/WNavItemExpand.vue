<template>
  <div>
    <WDropdownMenu
      :is-open="isDropdownOpen && !isActive"
      :horizontal-align="HorizontalAlign.RIGHT_OUTER"
    >
      <template #toggle>
        <WNavItem
          v-bind="isMobile || hasActive || even ? undefined : {
            onmouseenter: showDropdown,
            onmouseleave: hideDropdown,
          }"
          ref="component"
          :to="to ?? slotsDefault?.[0]?.props?.to"
          :title="title"
          :icon="icon"
          :skeleton="skeleton"
          :count="count"
          :counter="counter"
          :has-active="hasActive"
          :indent="indent"
          :even="even"
          :expand="!to"
          :query-fields="queryFields"
          :hovered="isDropdownOpen && !hasActive"
        >
          <template #icon>
            <slot name="icon" />
          </template>

          <template #right>
            <IconArrow
              class="square-3 transition-transform"
              :class="{
                '-rotate-90': !hasActive && !even,
              }"
            />
          </template>
        </WNavItem>
      </template>

      <template #content>
        <div
          class="px-1"
          @mouseenter="showDropdown"
          @mouseleave="hideDropdown"
        >
          <div
            class="
              bg-default dark:bg-default-dark w-nav-bar-width overflow-hidden rounded-xl border
              border-solid border-gray-200 text-start font-normal shadow dark:border-gray-800
            "
          >
            <template
              v-for="(slot, index) in slotsDefault"
              :key="index"
            >
              <component
                :is="slot"
                even
                @update:is-active="$event[1] && hideDropdown()"
              />
            </template>
          </div>
        </div>
      </template>
    </WDropdownMenu>

    <WExpansion :is-shown="isActive || even">
      <WNavItemTransition>
        <component
          :is="slot"
          v-for="(slot, index) in slotsDefault"
          :key="index"
          ref="inner"
          :even="even"
          :indent="!even"
        />
      </WNavItemTransition>
    </WExpansion>
  </div>
</template>

<script lang="ts" setup>
import type {NavItemExpandProps} from './types'

import {type VNode, computed, nextTick, onBeforeUnmount, ref, useSlots, useTemplateRef, watch} from 'vue'

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WExpansion from '@/components/Expansion/WExpansion.vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {useIsMobile} from '@/utils/mobile'
import {unwrapSlots} from '@/utils/utils'

import WNavItem from './WNavItem.vue'
import WNavItemTransition from './WNavItemTransition.vue'

defineProps<NavItemExpandProps>()

const slots = useSlots() as {
  default?: () => VNode[]
  icon?: () => VNode[]
}

const {isMobile} = useIsMobile()

const slotsDefault = computed(() => unwrapSlots(slots.default?.() ?? []))

const componentRef = useTemplateRef<typeof WNavItem>('component')
const innerRef = useTemplateRef<(typeof WNavItem)[] | undefined>('inner')

const isDropdownOpen = ref(false)
const hasActive = ref(false)

const isActive = computed(() => hasActive.value || (componentRef.value?.isActive ?? false))
const hasInnerActive = computed(() => innerRef.value?.some(item => item.isActive) ?? false)

const updateHasActive = async () => {
  await nextTick()

  hasActive.value = innerRef.value?.some(item => item.isActive) ?? false
}

const showDropdown = () => {
  isDropdownOpen.value = true
}

const hideDropdown = () => {
  isDropdownOpen.value = false
}

watch(hasInnerActive, updateHasActive, {immediate: true})
watch(isActive, updateHasActive, {immediate: true})
watch(slotsDefault, updateHasActive, {immediate: true})

watch(hasActive, () => {
  isDropdownOpen.value = false
}, {immediate: true})

onBeforeUnmount(() => {
  isDropdownOpen.value = false
})

defineSlots<{
  default?: () => VNode[]
  icon?: () => VNode[]
}>()

defineExpose({
  isActive,
})
</script>
