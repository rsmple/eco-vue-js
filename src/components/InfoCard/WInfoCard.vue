<template>
  <div 
    class="p-4 sm:rounded-3xl"
    :class="{
      // On phones it spans the screen: in an overlay frame to its edges, keeping the text at least as inset as on larger screens; on a page past its inset.
      'sm-not:w-frame-bleed sm-not:px-[max(var(--w-frame-padding),1rem)]': frame !== null,
      'sm-not:px---inner-margin sm-not:-mx---inner-margin': frame === null,
      [infoCardSemanticTypeMap[semanticType ?? SemanticType.SECONDARY]]: !noBg,
    }"
  >
    <slot name="top" />

    <div class="gap---inner-margin grid grid-cols-[auto_1fr]">
      <component
        :is="icon ?? IconInfo"
        v-if="!noIcon"
        class="square-[1.5em]"
        :class="[infoCardIconSemanticTypeMap[semanticType ?? SemanticType.SECONDARY], iconClass]"
      />

      <div class="text-pretty leading-relaxed">
        <slot />
      </div>
    </div>

    <slot name="bottom" />
  </div>
</template>

<script lang="ts" setup>
import IconInfo from '@/assets/icons/IconInfo.svg?component'

import {useOverlayFrame} from '@/utils/Overlay'
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
  /** Class to apply to icon */
  iconClass?: string
}>()

defineSlots<{
  /** Text of the card, next to the icon. */
  default?: () => void
  /** Content above the icon and text. */
  top?: () => void
  /** Content under the icon and text, such as actions. */
  bottom?: () => void
}>()

const frame = useOverlayFrame()
</script>