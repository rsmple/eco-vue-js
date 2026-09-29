<template>
  <div 
    class="sm-not:px---inner-margin sm-not:-mx---inner-margin p-4 sm:rounded-3xl"
    :class="{
      [infoCardSemanticTypeMap[semanticType ?? SemanticType.SECONDARY]]: !noBg,
    }"
  >
    <slot name="top" />

    <div class="gap---inner-margin grid grid-cols-[auto_1fr]">
      <component
        :is="icon ?? IconNegativeInfo"
        v-if="!noIcon"
        class="square-[1.5em] inline-block"
        :class="{
          [infoCardIconSemanticTypeMap[semanticType ?? SemanticType.SECONDARY]]: true,
          'rotate-180': !icon && semanticType !== SemanticType.WARNING && semanticType !== SemanticType.NEGATIVE,
          '**:stroke-2': !icon,
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
import IconNegativeInfo from '@/assets/icons/IconNegativeInfo.svg?component'

import {SemanticType} from '@/utils/SemanticType'

import {infoCardIconSemanticTypeMap, infoCardSemanticTypeMap} from './models/utils'

defineProps<{
  /** Drops the colored background, leaving the icon and text. */
  noBg?: boolean
  /** Hides the icon. */
  noIcon?: boolean
  /** Icon before the text. Defaults to an info icon, or an exclamation mark for `WARNING` and `NEGATIVE`. */
  icon?: SVGComponent
  /** Color scheme of the background and icon. Defaults to `SECONDARY`. */
  semanticType?: SemanticType
}>()

defineSlots<{
  /** Text of the card, next to the icon. */
  default?: () => void
  /** Content above the icon and text. */
  top?: () => void
  /** Content under the icon and text, such as actions. */
  bottom?: () => void
}>()
</script>