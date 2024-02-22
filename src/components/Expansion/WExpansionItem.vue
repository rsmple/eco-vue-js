<template>
  <div class="overflow-hidden">
    <component
      :is="$slots.title?.()?.[0] ?? 'button'"
      class="grid grid-cols-[1fr,auto] py-4 cursor-pointer select-none w-full text-start items-center"
      @click="$emit('toggle')"
    >
      <div
        class="relative text-base text-accent font-semibold pr-4 flex gap-2"
        :class="{'text-xs': minTitle, 'text-base': !minTitle}"
      >
        <template v-if="icon">
          <component
            :is="icon"
            class="square-6"
          />
        </template>

        <span class="pr-4 relative">
          {{ title }}

          <Transition
            enter-active-class="transition-opacity"
            leave-active-class="transition-opacity"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
          >
            <div
              v-if="hasFlag"
              class="absolute top-0 right-0 square-2 rounded-full bg-info dark:bg-info-dark"
            />
          </Transition>
        </span>
      </div>

      <div class="flex justify-center items-center ml-auto">
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

</script>
