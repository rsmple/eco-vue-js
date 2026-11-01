<template>
  <component
    :is="tag"
    class="surface-section grid gap-4"
  >
    <div
      v-if="title || eyebrow || $slots.title || $slots.actions"
      class="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <div class="mr-auto grid gap-1">
        <div
          v-if="eyebrow"
          class="text-description text-xs font-semibold tracking-wider uppercase"
        >
          {{ eyebrow }}
        </div>

        <component
          :is="isNested ? 'h3' : 'h2'"
          class="text-accent font-semibold"
          :class="isNested ? 'text-base' : 'text-xl'"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </component>
      </div>

      <slot name="actions" />
    </div>

    <slot />

    <div
      v-if="$slots.footer"
      class="border-line-subtle flex flex-wrap items-center justify-end gap-2 border-t border-solid pt-4"
    >
      <slot name="footer" />
    </div>
  </component>
</template>

<script lang="ts" setup>
import {inject, provide} from 'vue'

import {wSectionNested} from './models/injection'

withDefaults(
  defineProps<{
    /** Heading of the section. The `title` slot replaces it. */
    title?: string
    /** A short line above the heading, such as a step number. */
    eyebrow?: string
    /** Element to render. */
    tag?: string
  }>(),
  {
    title: undefined,
    eyebrow: undefined,
    tag: 'section',
  },
)

defineSlots<{
  /** Content of the section. */
  default?: () => void
  /** Heading of the section, in place of `title`. */
  title?: () => void
  /** Buttons beside the heading. */
  actions?: () => void
  /** Buttons under the content, past a line, such as Save. */
  footer?: () => void
}>()

// A section inside another one is a part of it: a smaller heading, one level down.
const isNested = inject(wSectionNested, false)

provide(wSectionNested, true)
</script>
