<template>
  <component
    v-bind="!to ? {target, href} : {to}"
    :is="to ? RouterLink : 'a'"
    class="cursor-pointer overflow-hidden truncate whitespace-normal font-normal no-underline hover:underline"
    :class="{
      'text-base': !small,
      'text-xs': small,
      [semanticTypeTextStylesMap[semanticType]]: true,
    }"
  >
    <IconLink
      class="inline rounded-lg p-px"
      :class="{
        'square-5 -mt-1 mr-1': !small,
        'square-3.5 -mt-0.5 mr-0.5': small,
        [semanticTypeChipsStylesMap[semanticType]]: true,
      }"
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
  small?: boolean
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
