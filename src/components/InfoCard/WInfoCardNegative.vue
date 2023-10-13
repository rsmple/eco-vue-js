<template>
  <div class="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mt-2">
    <div class="text-accent mb-2 font-normal">
      <IconDanger
        class="inline -mt-1 mr-2"
        :class="stylesMap[semanticType ?? SemanticType.NEGARIVE]"
      />{{ title }}
    </div>

    <span class="text-description font-normal">
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import {SemanticType} from '@/utils/SemanticType'
import IconDanger from '@/assets/icons/default/IconDanger.svg?component'

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