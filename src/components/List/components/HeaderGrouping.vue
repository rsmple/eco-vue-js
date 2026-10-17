<template>
  <WDropdownAdaptive
    :is-open="isOpen"
    @close="isOpen = false"
  >
    <template #toggle>
      <WButtonSelectionAction
        :icon="markRaw(IconLayer)"
        :active="isOpen || groupBy !== undefined"
        :tooltip-text="isOpen ? undefined : 'Group by'"
        label="Group by"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      />
    </template>

    <template #header>
      Group by
    </template>

    <template #content>
      <WMenuItem
        :active="groupBy === undefined"
        @click="select(undefined)"
      >
        <div class="flex-1 truncate font-normal">
          No grouping
        </div>
      </WMenuItem>

      <WMenuItem
        v-for="option in options"
        :key="option.value"
        :active="groupBy === option.value"
        @click="select(option.value)"
      >
        <div class="flex-1 truncate font-normal">
          {{ option.title }}
        </div>
      </WMenuItem>
    </template>
  </WDropdownAdaptive>
</template>

<script lang="ts" setup>
import type {ListGroupingOption} from '../types'

import {markRaw, ref} from 'vue'

import WButtonSelectionAction from '@/components/Button/WButtonSelectionAction.vue'
import WDropdownAdaptive from '@/components/DropdownMenu/WDropdownAdaptive.vue'
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

import IconLayer from '@/assets/icons/IconLayer.svg?component'

defineProps<{
  options: ListGroupingOption[]
  groupBy: string | undefined
}>()

const emit = defineEmits<{
  (e: 'update:group-by', value: string | undefined): void
}>()

const isOpen = ref(false)

const select = (value: string | undefined) => {
  isOpen.value = false
  emit('update:group-by', value)
}
</script>
