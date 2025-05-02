<template>
  <div 
    class="sm-not:-px--inner-margin sm-not:-mx---inner-margin p-4 sm:rounded-3xl"
    :class="{
      [infoCardSemanticTypeMap[semanticType ?? SemanticType.SECONDARY]]: !noBg,
    }"
  >
    <slot name="top" />

    <div class="-gap--inner-margin grid grid-cols-[auto,1fr]">
      <component
        :is="icon ?? IconNegativeInfo"
        v-if="!noIcon"
        class="square-[1.5em] inline-block"
        :class="{
          [infoCardIconSemanticTypeMap[semanticType ?? SemanticType.SECONDARY]]: true,
          'rotate-180': !icon && semanticType !== SemanticType.WARNING && semanticType !== SemanticType.NEGARIVE,
          '[&_*]:stroke-2': !icon,
        }"
      />

      <div class="text-pretty leading-relaxed">
        <slot />
      </div>
    </div>

    <slot name="bottom" />
  </div>
</template>

<script lang="ts" setup>
import IconNegativeInfo from '@/assets/icons/sax/IconNegativeInfo.svg?component'

import {SemanticType} from '@/utils/SemanticType'

import {infoCardIconSemanticTypeMap, infoCardSemanticTypeMap} from './models/utils'

defineProps<{
  noBg?: boolean
  noIcon?: boolean
  icon?: SVGComponent
  semanticType?: SemanticType
}>()
</script>