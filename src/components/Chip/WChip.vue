<template>
  <WSkeleton 
    v-if="isSkeleton"
    class="w-skeleton-h-5 max-w-28"
  />

  <div
    v-else
    class="w-max"
    :class="soft
      ? ['inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', semanticTypeChipSoftMap[semanticType]]
      : ['rounded-md px-2 py-0.5 text-xs font-semibold', semanticTypeChipMap[semanticType]]"
  >
    <component
      :is="icon"
      v-if="icon"
      class="square-[1em] shrink-0"
    />

    <slot>
      {{ text }}
    </slot>
  </div>
</template>

<script lang="ts" setup>
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {SemanticType, useSemanticTypeChipMap, useSemanticTypeChipSoftMap} from '@/utils/SemanticType'
import {useComponentStatesSkeleton} from '@/utils/useComponentStates'

const props = withDefaults(
  defineProps<{
    /** Label of the chip. The default slot replaces it. */
    text?: string
    /** Color scheme of the chip. */
    semanticType?: SemanticType
    /** Renders a rounded pill with a tinted background and colored text instead of a filled box. */
    soft?: boolean
    /** Icon shown before the label. */
    icon?: SVGComponent
    /** Shows a placeholder instead of the chip. When unset, inherits the skeleton state provided by a parent. */
    skeleton?: boolean
  }>(),
  {
    text: undefined,
    semanticType: SemanticType.SECONDARY,
    icon: undefined,
    skeleton: undefined,
  },
)

defineSlots<{
  /** Content of the chip, replacing `text`. */
  default?: () => void
}>()

const {isSkeleton} = useComponentStatesSkeleton(props)

const semanticTypeChipMap = useSemanticTypeChipMap()

const semanticTypeChipSoftMap = useSemanticTypeChipSoftMap()
</script>
