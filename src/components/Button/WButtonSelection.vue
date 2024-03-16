<template>
  <div class="grid grid-cols-[1fr,auto] h-12 pb-3 w-full">
    <div class="flex">
      <component
        :is="slot"
        v-for="(slot, index) in $slots.default?.()"
        :key="index"
        class="border-r border-solid border-gray-300 dark:border-gray-700 last:border-r-0"
      />

      <WDropdownMenu
        v-if="$slots.more?.()?.length"
        :is-open="isOpen"
        :max-width="200"
        :max-height="300"
        :horizontal-align="HorizontalAlign.RIGHT_INNER"
      >
        <template #toggle>
          <WButtonSelectionAction
            title="More"
            :icon="markRaw(IconMore)"
            :disable-message="disableMessageMore"
            @click="isOpen = !isOpen"
          />
        </template>

        <template #content>
          <WClickOutside
            class="my-2 grid grid-cols-1 bg-default dark:bg-default-dark shadow-md rounded-xl overflow-hidden dark:outline dark:outline-1 dark:outline-gray-800"
            @click="isOpen = false"
          >
            <component
              :is="slot"
              v-for="(slot, index) in $slots.more?.()"
              :key="index"
              class="first:pt-2 last:pb-2"
            />
          </WClickOutside>
        </template>
      </WDropdownMenu>
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedLength"
        class="flex gap-3 sm-not:gap-1"
      >
        <div class="flex items-center font-normal text-base sm-not:text-xs text-description whitespace-nowrap">
          <span class="sm-not:hidden">Selected&nbsp;</span><span class="text-primary-default dark:text-primary-dark font-semibold">{{ numberFormatter.format(selectedLength) }}</span><span class="sm-not:text-xs">&nbsp;{{ title ?? 'item' }}{{ selectedLength === 1 ? '' : 's' }}</span>
        </div>

        <div
          class="relative text-description sm-not:-px--inner-margin px-[1.125rem] flex items-center cursor-pointer select-none w-ripple w-ripple-hover"
          @click="$emit('clear:selected')"
        >
          <IconCancel />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {ref, markRaw} from 'vue'
import {numberFormatter} from '@/utils/utils'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import IconMore from '@/assets/icons/default/IconMore.svg?component'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WButtonSelectionAction from './WButtonSelectionAction.vue'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import WClickOutside from '../ClickOutside/WClickOutside.vue'

defineProps<{
  title?: string
  selectedLength?: number
  disableMessageMore?: string
}>()

defineEmits<{
  (e: 'clear:selected'): void
}>()

const isOpen = ref(false)

</script>