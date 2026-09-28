<template>
  <WSkeleton 
    v-if="isSkeleton"
    class="w-skeleton-h-5 max-w-28"
  />

  <div
    v-else
    class="w-max rounded-md px-2 py-0.5 text-xs font-semibold"
    :class="semanticTypeChipMap[semanticType]"
  >
    <slot>
      {{ text }}
    </slot>
  </div>
</template>

<script lang="ts" setup>
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {SemanticType, useSemanticTypeChipMap} from '@/utils/SemanticType'
import {useComponentStatesSkeleton} from '@/utils/useComponentStates'

const props = withDefaults(
  defineProps<{
    /** Label of the chip. The default slot replaces it. */
    text?: string
    /** Color scheme of the chip. */
    semanticType?: SemanticType
    /** Shows a placeholder instead of the chip. When unset, inherits the skeleton state provided by a parent. */
    skeleton?: boolean
  }>(),
  {
    text: undefined,
    semanticType: SemanticType.SECONDARY,
    skeleton: undefined,
  },
)

defineSlots<{
  /** Content of the chip, replacing `text`. */
  default?: () => void
}>()

const {isSkeleton} = useComponentStatesSkeleton(props)

const semanticTypeChipMap = useSemanticTypeChipMap()
</script>