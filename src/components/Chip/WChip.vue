<template>
  <WSkeleton 
    v-if="isSkeleton"
    class="w-skeleton-h-5 max-w-28"
  />

  <div
    v-else
    class="w-max rounded-md px-2 py-0.5 text-xs font-semibold text-default"
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
    text?: string
    semanticType?: SemanticType
    skeleton?: boolean
  }>(),
  {
    text: undefined,
    semanticType: SemanticType.SECONDARY,
    skeleton: undefined,
  },
)

const {isSkeleton} = useComponentStatesSkeleton(props)

const semanticTypeChipMap = useSemanticTypeChipMap()
</script>