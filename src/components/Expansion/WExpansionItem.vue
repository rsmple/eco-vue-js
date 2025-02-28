<template>
  <component
    :is="$slots.title?.()?.[0] ?? 'button'"
    class="w-ripple w-ripple-hover -px--inner-margin relative grid w-full cursor-pointer select-none grid-cols-[auto,1fr,auto] items-center gap-2 py-3 text-start"
    @click="$emit('toggle')"
  >
    <template v-if="icon">
      <component
        :is="icon"
        class="square-6"
      />
    </template>

    <div class="col-start-2">
      <span
        class="relative pr-4 font-semibold" 
        :class="{'text-xs': minTitle, 'text-base': !minTitle}"
      >
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

    <div class="col-start-3 ml-auto flex items-center justify-center">
      <IconArrow
        class="text-accent transition-transform"
        :class="{'rotate-180': isOpen}"
      />
    </div>
  </component>

  <WExpansion
    :is-open="isOpen"
    :class="$attrs.class"
    class="mt-2"
  >
    <slot />
  </WExpansion>
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
