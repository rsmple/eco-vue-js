<template>
  <div class="flex h-12 pb-3 w-full">
    <div class="flex flex-1">
      <slot />
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
import {numberFormatter} from '@/utils/utils'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

defineProps<{
  title?: string
  selectedLength?: number
}>()

defineEmits<{
  (e: 'clear:selected'): void
}>()

</script>