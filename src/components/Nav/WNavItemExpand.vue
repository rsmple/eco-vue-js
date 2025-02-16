<template>
  <div>
    <WNavItem
      :to="to ?? slotsDefault?.[0]?.props?.to"
      :title="title"
      :icon="icon"
      :skeleton="skeleton"
      :count="count"
      :counter="counter"
      :has-active="hasActiveCached"
      :indent="indent"
      :expand="!to"
      :query-fields="queryFields"
      @update:is-active="isOpen = $event[1]; $event[1] && $emit('update:isActive', [title, $event[1]])"
    >
      <template #icon>
        <slot name="icon" />
      </template>

      <template #right>
        <IconArrow
          class="square-3 transition-transform"
          :class="{
            '-rotate-90': !hasActiveCached,
          }"
        />
      </template>
    </WNavItem>

    <WExpansion :is-shown="hasActiveCached">
      <WNavItemTransition>
        <template
          v-for="(slot, index) in slotsDefault"
          :key="index"
        >
          <component
            :is="slot"
            indent
            @update:is-active="isActiveChildrenMap[$event[0]] = $event[1]"
          />
        </template>
      </WNavItemTransition>
    </WExpansion>
  </div>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {computed, onBeforeUnmount, reactive, ref, useSlots, watch} from 'vue'

import WExpansion from '@/components/Expansion/WExpansion.vue'

import IconArrow from '@/assets/icons/default/IconArrow.svg?component'

import {debounce} from '@/utils/utils'

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
}

const props = defineProps<Props>()
const slots = useSlots()

const slotsDefault = computed(() => slots.default?.())

const emit = defineEmits<{
  (e: 'update:isActive', value: [string, boolean]): void
}>()

const isOpen = ref(false)
const hasActiveCached = ref(false)

const isActiveChildrenMap = reactive<Record<string, boolean>>({})
const hasActive = computed<boolean>(() => isOpen.value || Object.values(isActiveChildrenMap).includes(true))

const updateHasActiveCache = debounce((value) => {
  hasActiveCached.value = value

  emit('update:isActive', [props.title, value])
}, 10)

watch(hasActive, updateHasActiveCache, {immediate: true})

onBeforeUnmount(() => {
  emit('update:isActive', [props.title, false])
})
</script>
