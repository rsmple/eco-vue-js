<template>
  <div class="sm:left-inner sm:w-inner grid w-full grid-cols-[1fr,auto] pb-3 sm:sticky">
    <div class="flex">
      <slot
        v-bind="{
          disableMessage: disableMessageValue,
          cssClass: 'border-r border-solid border-gray-300 dark:border-gray-700 last:border-r-0'
        }"
      />

      <WDropdownMenu
        v-if="$slots.more"
        :is-open="isOpen"
        :max-width="200"
        :max-height="300"
        :horizontal-align="HorizontalAlign.RIGHT_INNER"
      >
        <template #toggle>
          <WButtonSelectionAction
            title="More"
            :icon="markRaw(IconMore)"
            :disable-message="disableMessageValue"
            @click="isOpen = !isOpen"
          />
        </template>

        <template #content>
          <WClickOutside
            class="bg-default dark:bg-default-dark my-2 grid grid-cols-1 overflow-hidden rounded-xl shadow-md dark:outline dark:outline-1 dark:outline-gray-800"
            @click="isOpen = false"
          >
            <slot
              name="more"
              v-bind="{
                disableMessage: disableMessageValue,
                cssClass: 'first:pt-2 last:pb-2'
              }"
            />
          </WClickOutside>
        </template>
      </WDropdownMenu>
    </div>

    <WButtonSelectionState
      v-if="selectedCount"
      @click="$emit('clear:selection')"
    >
      <span class="sm-not:hidden">Selected&nbsp;</span><span class="text-primary-default dark:text-primary-dark font-semibold">{{ numberFormatter.format(selectedCount) }}</span><span class="sm-not:text-xs">&nbsp;{{ title }}{{ selectedCount === 1 ? '' : 's' }}</span>
    </WButtonSelectionState>

    <slot
      v-else
      name="settings"
    />
  </div>
</template>

<script lang="ts" setup>
import {type VNode, computed, markRaw, ref} from 'vue'

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconMore from '@/assets/icons/default/IconMore.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {numberFormatter} from '@/utils/utils'

import WButtonSelectionAction from './WButtonSelectionAction.vue'
import WButtonSelectionState from './WButtonSelectionState.vue'

import WClickOutside from '../ClickOutside/WClickOutside.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    disableMessage?: string
    selectedCount?: number
  }>(),
  {
    title: 'item',
    disableMessage: 'No selected items',
    selectedCount: undefined,
  },
)

defineEmits<{
  (e: 'clear:selection'): void
}>()

const isOpen = ref(false)

const disableMessageValue = computed<string | undefined>(() => props.selectedCount === 0 ? props.disableMessage : undefined)

defineSlots<{
  default?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  more?: (props: {disableMessage: string | undefined, cssClass: string}) => VNode[]
  settings?: () => VNode[]
}>()
</script>