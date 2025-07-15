<template>
  <WSkeleton 
    v-if="isSkeleton"
    class="w-skeleton-h-5 max-w-28"
  />

  <div
    v-else
    class="w-min rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold dark:bg-gray-800"
    :class="classMap[semanticType]"
  >
    <slot>
      {{ text }}
    </slot>
  </div>
</template>

<script lang="ts" setup>
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {SemanticType} from '@/utils/SemanticType'
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

const classMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'text-primary dark:text-primary-dark',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.NEGARIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}
</script>