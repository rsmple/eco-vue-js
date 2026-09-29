<template>
  <component
    :is="$slots.title?.()?.[0] ?? 'div'"
    ref="button"
    role="button"
    tabindex="0"
    :aria-expanded="isOpen"
    class="w-ripple w-ripple-hover px---inner-margin relative grid cursor-pointer select-none grid-cols-[1fr_auto] items-center gap-2 py-3 text-start"
    :class="toggleClass"
    @click="toggle"
    @keydown.enter="toggle"
    @keydown.space="toggle"
  >
    <div>
      <component
        :is="icon"
        v-if="icon"
        class="square-[1.25em] -mt-1 inline"
      /> <span
        class="relative pr-4 font-semibold" 
        :class="{'text-xs': minTitle}"
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
        class="text-accent square-[1.25em] transition-transform"
        :class="{'rotate-180': isOpen}"
      />
    </div>
  </component>

  <WExpansion
    :is-open="isOpen"
    :class="$attrs.class"
  >
    <slot />
  </WExpansion>
</template>

<script lang="ts" setup>
import {type VNode, useTemplateRef} from 'vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'

import WExpansion from './WExpansion.vue'

defineProps<{
  /** Expands the content. The item doesn't toggle itself: set it on `toggle`. */
  isOpen?: boolean
  /** Text of the toggle row. */
  title?: string
  /** Icon before the title. */
  icon?: SVGComponent
  /** Shows a dot after the title, e.g. for new content inside. */
  hasFlag?: boolean
  /** Smaller title text. */
  minTitle?: boolean
  /** Class of the toggle row. */
  toggleClass?: string
}>()

const emit = defineEmits<{
  /** The toggle row was clicked, or Enter or Space was pressed on it. */
  (e: 'toggle'): void
}>()

defineSlots<{
  /** Content that expands under the toggle row. The component's class goes on it. */
  default?: () => VNode[]
  /** An empty element that the toggle row renders as instead of a `div`, e.g. `<h3 />` for a heading. */
  title?: () => VNode[]
}>()

const buttonRef = useTemplateRef<HTMLButtonElement | ComponentInstance<unknown>>('button')

const toggle = () => {
  emit('toggle')

  const element = buttonRef.value?.$el instanceof Element ? buttonRef.value.$el : buttonRef.value

  if (element instanceof HTMLElement) element.blur()
}
</script>
