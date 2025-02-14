<template>
  <component
    v-bind="!to ? {target, href} : {to}"
    :is="to ? RouterLink : 'a'"
    class="cursor-pointer overflow-hidden truncate whitespace-normal font-normal no-underline hover:underline"
    :class="semanticTypeTextStylesMap[semanticType]"
  >
    <IconLink
      class="square-[1.25em] mr-[0.25em] mt-[-0.25em] inline rounded-[0.5em] p-px"
      :class="semanticTypeChipsStylesMap[semanticType]"
    /><slot>{{ text }}</slot>
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import IconLink from '@/assets/icons/sax/IconLink.svg?component'

import {semanticTypeChipsStylesMap, semanticTypeTextStylesMap} from '@/components/Button/models/semanticTypeStylesMap'
import {SemanticType} from '@/utils/SemanticType'

interface Props extends Partial<LinkProps> {
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  text?: string
  semanticType?: SemanticType
}

withDefaults(
  defineProps<Props>(),
  {
    semanticType: SemanticType.PRIMARY,
    to: undefined,
    href: undefined,
    target: undefined,
    text: undefined,
  },
)
</script>
