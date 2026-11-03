<template>
  <component
    :is="tag"
    class="surface-section grid gap-4"
    :class="semanticType && semanticType !== SemanticType.SECONDARY ? ['surface-section-tone', sectionToneMap[semanticType]] : undefined"
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
          class="font-semibold"
          :class="[isNested ? 'text-base' : 'text-xl', semanticType && semanticType !== SemanticType.SECONDARY ? 'text-tone' : 'text-accent']"
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
    /** Element to render. */
    tag?: string
    /**
     * Paints the section in the type's soft tone in every layout style, and its heading in the tone, such as a danger
     * zone with `NEGATIVE`. `SECONDARY` is a plain section.
     */
    semanticType?: SemanticType
  }>(),
  {
    title: undefined,
    eyebrow: undefined,
    semanticType: undefined,
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

// A section inside another one, or in a modal, is a part of it: a smaller heading, one level down.
const isNested = inject(wSectionNested, false) || inject(wIsModal, false)

provide(wSectionNested, true)
</script>
