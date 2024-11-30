<template>
  <div class="mt-2 rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
    <div class="text-accent mb-2 text-balance font-normal">
      <IconDanger
        class="-mt-1 mr-2 inline"
        :class="stylesMap[semanticType ?? SemanticType.NEGARIVE]"
      />{{ title }}
    </div>

    <span class="text-description text-balance font-normal">
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import IconDanger from '@/assets/icons/default/IconDanger.svg?component'

import {SemanticType} from '@/utils/SemanticType'

const stylesMap: Record<SemanticType, string> = {
  [SemanticType.PRIMARY]: 'text-primary-default dark:text-primary-dark',
  [SemanticType.SECONDARY]: 'text-description',
  [SemanticType.NEGARIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}

defineProps<{
  title: string
  semanticType?: SemanticType
}>()
</script>