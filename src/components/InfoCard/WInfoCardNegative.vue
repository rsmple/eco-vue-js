<template>
  <div class="mt-2 rounded-2xl bg-surface-muted p-4">
    <div class="text-accent mb-2 text-balance font-normal">
      <IconDanger
        class="-mt-1 mr-2 inline"
        :class="stylesMap[semanticType ?? SemanticType.NEGATIVE]"
      />{{ title }}
    </div>

    <span class="text-description text-balance font-normal">
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import IconDanger from '@/assets/icons/IconDanger.svg?component'

import {SemanticType} from '@/utils/SemanticType'

const stylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'tone-primary text-tone',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.NEGATIVE]: 'tone-negative text-tone',
  [SemanticType.POSITIVE]: 'tone-positive text-tone',
  [SemanticType.WARNING]: 'tone-warning text-tone',
  [SemanticType.INFO]: 'tone-info text-tone',
}

defineProps<{
  /** Heading of the card, after a warning icon. */
  title: string
  /** Color of the icon. Defaults to `NEGATIVE`. */
  semanticType?: SemanticType
}>()

defineSlots<{
  /** Description under the title. */
  default?: () => void
}>()
</script>