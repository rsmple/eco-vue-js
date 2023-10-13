<template>
  <div
    class="text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded-md w-min px-2 py-0.5"
    :class="classMap[semanticType ?? SemanticType.SECONDARY]"
  >
    <slot>
      {{ text }}
    </slot>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from '@/utils/SemanticType'

defineProps<{
  text?: string
  semanticType?: SemanticType
}>()

const classMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'text-primary-default dark:text-primary-dark',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.NEGARIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}

</script>