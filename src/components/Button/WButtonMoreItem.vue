<template>
  <WMenuItem
    :to="to"
    :href="href"
    :download="download"
    :disabled="disabled"
    :tooltip-text="tooltipText"
    :semantic-type="semanticType"
    @click="$emit('click', $event)"
  >
    <div class="min-w-20 flex-1 text-start">
      <slot>
        {{ text }}
      </slot>
    </div>

    <slot name="icon">
      <template v-if="icon">
        <component
          :is="icon"
          class="square-[1.25em]"
        />
      </template>
    </slot>
  </WMenuItem>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'
import type {SemanticType} from '@/utils/SemanticType'

import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

interface Props extends Partial<LinkProps> {
  /** Label. The `default` slot replaces it. */
  text?: string
  /** Icon after the label. The `icon` slot replaces it. */
  icon?: SVGComponent
  /** Blocks clicks and dims the item. */
  disabled?: boolean
  /** Renders the item as a link to this URL. */
  href?: string
  /** Native `download` attribute, with `href`. */
  download?: string
  /** Tooltip over the item. */
  tooltipText?: string
  /** Color of the item. Types other than `primary` and `secondary` color the text at rest — a red "Delete". */
  semanticType?: SemanticType
}

defineProps<Props>()

defineEmits<{
  /** The item was clicked. */
  (e: 'click', value: MouseEvent): void
}>()

defineSlots<{
  /** Label. Replaces `text`. */
  default?: () => void
  /** Icon after the label. Replaces `icon`. */
  icon?: () => void
}>()
</script>