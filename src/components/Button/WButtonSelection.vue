<template>
  <div class="sm:left-inner sm:w-inner grid h-12 w-full grid-cols-[1fr,auto] pb-3 sm:sticky">
    <div class="flex">
      <slot
        v-bind="{
          disableMessage: disableMessageValue,
          cssClass: 'border-r border-solid border-gray-300 dark:border-gray-700 last:border-r-0'
        }"
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

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selectedCount"
        class="sm-not:gap-1 grid grid-cols-[1fr,auto] gap-3"
      >
        <div class="sm-not:text-xs text-description self-center truncate whitespace-nowrap text-base font-normal">
          <span class="sm-not:hidden">Selected&nbsp;</span><span class="text-primary-default dark:text-primary-dark font-semibold">{{ numberFormatter.format(selectedCount) }}</span><span class="sm-not:text-xs">&nbsp;{{ title }}{{ selectedCount === 1 ? '' : 's' }}</span>
        </div>

        <button
          class="text-description w-ripple w-ripple-hover relative flex cursor-pointer select-none items-center justify-self-end"
          @click="clearSelected"
        >
          <IconCancel class="square-5 sm-not:-mx--inner-margin mx-[1.125rem]" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, markRaw, ref, watch} from 'vue'

import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'

import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import IconMore from '@/assets/icons/default/IconMore.svg?component'

import {HorizontalAlign} from '@/utils/HorizontalAlign'
import {numberFormatter} from '@/utils/utils'

import WButtonSelectionAction from './WButtonSelectionAction.vue'

import WClickOutside from '../ClickOutside/WClickOutside.vue'
import {wInfiniteListSelection} from '../InfiniteList/models/injection'

const props = withDefaults(
  defineProps<{
    title?: string
    disableMessage?: string
  }>(),
  {
    title: 'item',
    disableMessage: 'No selected items',
  },
)

const emit = defineEmits<{
  (e: 'update:selectionCount', value: number): void
}>()

const isOpen = ref(false)

const {
  selectedCount,
  clearSelected,
} = inject(wInfiniteListSelection, {})

const disableMessageValue = computed<string | undefined>(() => selectedCount?.value === 0 ? props.disableMessage : undefined)

if (selectedCount) {
  watch(selectedCount, value => {
    emit('update:selectionCount', value)
  }, {immediate: true})
}

defineExpose({
  clearSelected,
})
</script>