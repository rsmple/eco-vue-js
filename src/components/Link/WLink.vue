<template>
  <component
    v-bind="!to ? {href, target, rel} : {to, target, rel}"
    :is="to ? WRouterLink : 'a'"
    class="cursor-pointer overflow-hidden truncate whitespace-normal font-normal no-underline hover:underline"
    :class="semanticTypeTextMap[semanticType]"
  >
    <component
      :is="icon ?? IconLink"
      class="square-[1.25em] mr-[0.25em] mt-[-0.25em] inline rounded-[0.5em] p-px"
      :class="semanticTypeChipMap[semanticType]"
    /><slot>{{ text }}</slot>
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'

import IconLink from '@/assets/icons/IconLink.svg?component'

import {SemanticType, useSemanticTypeChipMap, useSemanticTypeTextMap} from '@/utils/SemanticType'

interface Props extends Partial<LinkProps> {
  /** URL of the link, when there is no `to`. */
  href?: string
  /** `target` attribute of the link. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** `rel` attribute of the link. */
  rel?: string
  /** Text of the link. The default slot replaces it. */
  text?: string
  /** Color of the text and the icon's chip. */
  semanticType?: SemanticType
  /** Icon before the text, in a chip. Defaults to a link icon. */
  icon?: SVGComponent
}

withDefaults(
  defineProps<Props>(),
  {
    semanticType: SemanticType.PRIMARY,
    to: undefined,
    href: undefined,
    target: undefined,
    rel: undefined,
    text: undefined,
    icon: undefined,
  },
)

defineSlots<{
  /** Text of the link, replacing `text`. */
  default?: () => void
}>()

const semanticTypeChipMap = useSemanticTypeChipMap()
const semanticTypeTextMap = useSemanticTypeTextMap()
</script>
