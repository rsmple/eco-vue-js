<template>
  <div>
    <WDropdownMenu
      :is-open="isDropdownOpen && !hasActiveCached"
      :max-width="320"
      :max-height="320"
      :horizontal-align="HorizontalAlign.RIGHT_OUTER"
    >
      <template #toggle>
        <WNavItem
          v-bind="isMobile || hasActiveCached || even ? undefined : {
            onmouseenter: showDropdown,
            onmouseleave: hideDropdown,
          }"
          :to="to ?? slotsDefault?.[0]?.props?.to"
          :title="title"
          :icon="icon"
          :skeleton="skeleton"
          :count="count"
          :counter="counter"
          :has-active="hasActiveCached"
          :indent="indent"
          :even="even"
          :expand="!to"
          :query-fields="queryFields"
          :hovered="isDropdownOpen && !hasActiveCached"
          @update:is-active="
            isOpen = $event[1];
            $event[1] && $emit('update:isActive', [title, $event[1]]);
            $event[1] && hideDropdown();
          "
        >
          <template #icon>
            <slot name="icon" />
          </template>

          <template #right>
            <IconArrow
              class="square-3 transition-transform"
              :class="{
                '-rotate-90': !hasActiveCached && !even,
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

    <WExpansion :is-shown="hasActiveCached || even">
      <WNavItemTransition>
        <template
          v-for="(slot, index) in slotsDefault"
          :key="index"
        >
          <component
            :is="slot"
            :even="even"
            :indent="!even"
            @update:is-active="isActiveChildrenMap[$event[0]] = $event[1]; $event[1] && hideDropdown()"
          />
        </template>
      </WNavItemTransition>
    </WExpansion>
  </div>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {type VNode, computed, onBeforeUnmount, reactive, ref, useSlots, watch} from 'vue'

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WExpansion from '@/components/Expansion/WExpansion.vue'

import IconArrow from '@/assets/icons/default/IconArrow.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {useIsMobile} from '@/utils/mobile'
import {debounce, unwrapSlots} from '@/utils/utils'

import WNavItem from './WNavItem.vue'
import WNavItemTransition from './WNavItemTransition.vue'

interface Props extends Partial<LinkProps> {
  icon?: SVGComponent
  title: string
  count?: number
  counter?: number
  skeleton?: boolean
  indent?: boolean
  queryFields?: string[]
  even?: boolean
}

const props = defineProps<Props>()
const slots = useSlots()

const {isMobile} = useIsMobile()

const slotsDefault = computed(() => unwrapSlots(slots.default?.() ?? []))

const emit = defineEmits<{
  (e: 'update:isActive', value: [string, boolean]): void
}>()

const isOpen = ref(false)
const hasActiveCached = ref(false)
const isDropdownOpen = ref(false)

const isActiveChildrenMap = reactive<Record<string, boolean>>({})
const hasActive = computed<boolean>(() => isOpen.value || Object.values(isActiveChildrenMap).includes(true))

const updateHasActiveCache = debounce((value) => {
  hasActiveCached.value = value
  isDropdownOpen.value = false

  emit('update:isActive', [props.title, value])
}, 10)

const showDropdown = () => {
  isDropdownOpen.value = true
}

const hideDropdown = () => {
  isDropdownOpen.value = false
}

watch(hasActive, updateHasActiveCache, {immediate: true})

onBeforeUnmount(() => {
  isDropdownOpen.value = false
  emit('update:isActive', [props.title, false])
})

defineSlots<{
  default?: () => VNode[]
  icon?: () => VNode[]
}>()
</script>
