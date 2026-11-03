<template>
  <component
    :is="tag"
    class="surface-section gap-4"
    :class="[
      scroll ? 'surface-section-scroll flex flex-col' : 'grid',
      semanticType && semanticType !== SemanticType.SECONDARY ? ['surface-section-tone', sectionToneMap[semanticType]] : undefined,
    ]"
  >
    <div
      v-if="title || eyebrow || description || $slots.title || $slots.description || $slots.actions"
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
          class="font-semibold"
          :class="[isNested ? 'text-base' : 'text-xl', semanticType && semanticType !== SemanticType.SECONDARY ? 'text-tone' : 'text-accent']"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </component>

        <p
          v-if="description || $slots.description"
          class="text-description max-w-prose text-sm text-pretty"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </div>

      <slot name="actions" />
    </div>

    <slot name="head" />

    <div
      v-if="scroll"
      class="surface-section-body grid content-start gap-4"
    >
      <slot />
    </div>

    <slot v-else />

    <div
      v-if="$slots.footer"
      class="surface-section-footer flex flex-wrap items-center gap-2"
    >
      <slot name="footer" />
    </div>
  </component>
</template>

<script lang="ts" setup>
import {inject, provide} from 'vue'

import {wIsModal} from '@/components/Modal/models/injection'
import {SemanticType} from '@/utils/SemanticType'

import {wSectionNested} from './models/injection'
import {sectionToneMap} from './models/utils'

withDefaults(
  defineProps<{
    /** Heading of the section. The `title` slot replaces it. */
    title?: string
    /** A short line above the heading, such as a step number. */
    eyebrow?: string
    /**
     * A line under the heading on what the section is for, such as what a danger zone's action deletes and what stays,
     * with its button in the `footer`.
     */
    description?: string
    /** Element to render. */
    tag?: string
    /**
     * Paints the section in the type's soft tone in every layout style, and its heading in the tone, such as a danger
     * zone with `NEGATIVE`. `SECONDARY` is a plain section.
     */
    semanticType?: SemanticType
    /**
     * Keeps to the height the page gives it, such as a column stuck beside a list, and scrolls its content inside, under
     * the heading and the `head` slot, which stay. The content scrolls to the section's bottom edge: nothing sticky has
     * to repaint the section over it, so it looks the same in every layout style.
     */
    scroll?: boolean
  }>(),
  {
    title: undefined,
    eyebrow: undefined,
    description: undefined,
    semanticType: undefined,
    tag: 'section',
  },
)

defineSlots<{
  /** Content of the section. */
  default?: () => void
  /** Heading of the section, in place of `title`. */
  title?: () => void
  /** Line under the heading, in place of `description`. */
  description?: () => void
  /** Buttons beside the heading. */
  actions?: () => void
  /**
   * Content under the heading, before the content: with `scroll` it stays in view while the content scrolls, such as
   * the item a list in the section belongs to, or a label of its own in place of the heading.
   */
  head?: () => void
  /** Buttons under the content, such as Save: past a line, or on the page in flat, past a space. */
  footer?: () => void
}>()

// A section inside another one, or in a modal, is a part of it: a smaller heading, one level down.
const isNested = inject(wSectionNested, false) || inject(wIsModal, false)

provide(wSectionNested, true)
</script>
