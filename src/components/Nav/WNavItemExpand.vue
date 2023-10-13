<template>
  <div>
    <WNavItem
      :to="to"
      :title="title"
      :icon="icon"
      :new-label="newLabel"
      :skeleton="skeleton"
      :count="count"
      :has-active="hasActive || isOpen"
      @update:is-active="isOpen = $event[title]"
    >
      <template #icon>
        <IconArrow
          class="square-4 mx-1 transition-transform"
          :class="{'rotate-180': hasActive || isOpen}"
        />
      </template>
    </WNavItem>

    <WExpansion :is-shown="isOpen || hasActive">
      <WNavItemTransition>
        <template
          v-for="(slot, index) in $slots.default?.()"
          :key="index"
        >
          <component
            :is="slot"
            @update:is-active="updateIsActive"
          />
        </template>
      </WNavItemTransition>
    </WExpansion>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import type {RouteLocationRaw} from 'vue-router'
import IconArrow from '@/assets/icons/default/IconArrow.svg?component'
import WNavItem from './WNavItem.vue'
import WExpansion from '@/components/Expansion/WExpansion.vue'
import WNavItemTransition from './WNavItemTransition.vue'

defineProps<{
  icon?: SVGComponent
  to: RouteLocationRaw
  title: string
  count?: number
  skeleton?: boolean
  newLabel?: boolean
}>()

const isOpen = ref(false)

const isActiveChildrenMap = ref<Record<string, boolean>>({})
const hasActive = computed<boolean>(() => Object.values(isActiveChildrenMap.value).includes(true))

const updateIsActive = (value: Record<string, boolean>): void => {
  isActiveChildrenMap.value = {...isActiveChildrenMap.value, ...value}
}

</script>
