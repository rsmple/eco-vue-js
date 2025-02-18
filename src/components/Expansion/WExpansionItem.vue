<template>
  <div class="overflow-hidden">
    <component
      :is="$slots.title?.()?.[0] ?? 'button'"
      class="grid w-full cursor-pointer select-none grid-cols-[1fr,auto] items-center py-4 text-start"
      @click="$emit('toggle')"
    >
      <div
        class="text-accent relative flex gap-2 pr-4 text-base font-semibold"
        :class="{'text-xs': minTitle, 'text-base': !minTitle}"
      >
        <template v-if="icon">
          <component
            :is="icon"
            class="square-6"
          />
        </template>

        <span class="relative pr-4">
          {{ title }}

          <Transition
            enter-active-class="transition-opacity"
            leave-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div
              v-if="hasFlag"
              class="square-2 bg-info dark:bg-info-dark absolute right-0 top-0 rounded-full"
            />
          </Transition>
        </span>
      </div>

      <div class="ml-auto flex items-center justify-center">
        <IconArrow
          class="text-accent transition-transform"
          :class="{'rotate-180': isOpen}"
        />
      </div>
    </component>

    <WExpansion :is-open="isOpen">
      <slot />
    </WExpansion>
  </div>
</template>

<script lang="ts" setup>
import type {VNode} from 'vue'

import IconArrow from '@/assets/icons/default/IconArrow.svg?component'

import WExpansion from './WExpansion.vue'

defineProps<{
  isOpen?: boolean
  title?: string
  icon?: SVGComponent
  hasFlag?: boolean
  minTitle?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()

defineSlots<{
  default?: () => VNode[]
  title?: () => VNode[]
}>()
</script>
