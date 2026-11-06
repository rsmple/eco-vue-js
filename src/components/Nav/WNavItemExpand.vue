<template>
  <WNavItem
    v-if="!slotsDefault.length"
    v-bind="($props as LinkProps)"
  >
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
  </WNavItem>

  <div v-else>
    <WDropdownMenu
      :is-open="isDropdownOpen && !isActive"
      :horizontal-align="HorizontalAlign.RIGHT_OUTER"
      :parent-element="componentRef?.anchorRef ?? undefined"
      dropdown-class="w-nav-group-dropdown relative w-max"
    >
      <template #toggle>
        <WNavItem
          v-bind="isMobile || hasActive || even ? undefined : {
            onMouseenter: showDropdown,
            onMouseleave: hideDropdown,
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
          :param-fields="paramFields"
          :hovered="isDropdownOpen && !hasActive"
        >
          <template
            v-if="$slots.icon"
            #icon
          >
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
        <WClickOutside
          class="w-nav-group-dropdown-content px-1"
          @mouseenter="showDropdown"
          @mouseleave="hideDropdown"
          @click="hideDropdown"
        >
          <div
            class="
              w-nav-bar w-nav-bar-dropdown w-nav-bar-width overflow-y-auto overscroll-contain
              border border-solid border-line-raised text-start font-normal shadow
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
        </WClickOutside>
      </template>
    </WDropdownMenu>

    <WExpansion
      :is-shown="isActive || even"
      :class="{'w-nav-group-collapsed': !isActive && !even}"
    >
      <WNavItemTransition>
        <component
          :is="slot"
          v-for="(slot, index) in slotsDefault"
          :key="index"
          ref="inner"
          :even="even"
          :indent="even ? undefined : (indent ?? 0) + 1"
        />
      </WNavItemTransition>
    </WExpansion>
  </div>
</template>

<script lang="ts" setup>
import type {NavItemExpandProps} from './types'
import type {LinkProps} from '@/types/types.js'

import {type VNode, computed, nextTick, ref, useSlots, useTemplateRef, watch} from 'vue'

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WExpansion from '@/components/Expansion/WExpansion.vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {useIsMobile} from '@/utils/mobile'
import {unwrapSlots} from '@/utils/utils'

import WNavItem from './WNavItem.vue'
import WNavItemTransition from './WNavItemTransition.vue'
import {useNavGroupDropdown} from './use/useNavGroupDropdown'

import WClickOutside from '../ClickOutside/WClickOutside.vue'

defineProps<NavItemExpandProps>()

const slots = useSlots() as {
  default?: () => VNode[]
  icon?: () => VNode[]
}

const {isMobile} = useIsMobile()

const slotsDefault = computed(() => unwrapSlots(slots.default?.() ?? []))

const componentRef = useTemplateRef<typeof WNavItem>('component')
const innerRef = useTemplateRef<(typeof WNavItem)[] | undefined>('inner')

const {isOpen: isDropdownOpen, show: showDropdown, hide: hideDropdown, close: closeDropdown} = useNavGroupDropdown()
const hasActive = ref(false)

const hasInnerActive = computed(() => innerRef.value?.some(item => item.isActive) ?? false)
const isActive = computed(() => hasInnerActive.value || hasActive.value || (componentRef.value?.isActive ?? false))

const isVisible = computed(() => isDropdownOpen.value || isActive.value)

const updateHasActive = async () => {
  await nextTick()

  hasActive.value = innerRef.value?.some(item => item.isActive) ?? false
}

watch(hasInnerActive, value => {
  hasActive.value = value

  updateHasActive()
}, {immediate: true})
watch(isActive, updateHasActive, {immediate: true})
watch(slotsDefault, updateHasActive, {immediate: true})

watch(hasActive, closeDropdown, {immediate: true})

defineSlots<{
  /** WNavItem items of the group. They show under the group while one of them is active, and in a menu on hover otherwise. */
  default?: () => VNode[]
  /** Icon before the title, when `icon` isn't set. */
  icon?: () => VNode[]
}>()

defineExpose({
  isActive,
  isVisible,
})
</script>
