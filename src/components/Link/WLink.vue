<template>
  <component
    v-bind="!to ? {target, href} : {to}"
    :is="to ? RouterLink : 'a'"
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

import {RouterLink} from 'vue-router'

import IconLink from '@/assets/icons/sax/IconLink.svg?component'

import {SemanticType, useSemanticTypeChipMap, useSemanticTypeTextMap} from '@/utils/SemanticType'

interface Props extends Partial<LinkProps> {
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  text?: string
  semanticType?: SemanticType
  icon?: SVGComponent
}

withDefaults(
  defineProps<Props>(),
  {
    semanticType: SemanticType.PRIMARY,
    to: undefined,
    href: undefined,
    target: undefined,
    text: undefined,
    icon: undefined,
  },
)

const semanticTypeChipMap = useSemanticTypeChipMap()
const semanticTypeTextMap = useSemanticTypeTextMap()
</script>
