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
        class="square-6 sm-not:-mx-1 inline-block"
        :class="{
          [infoCardIconSemanticTypeMap[semanticType ?? SemanticType.SECONDARY]]: true,
          'rotate-180': !icon,
        }"
      />

      <div class="text-pretty py-1 leading-relaxed">
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