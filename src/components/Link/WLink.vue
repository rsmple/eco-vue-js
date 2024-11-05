<template>
  <component
    v-bind="!to ? {target, href} : {to}"
    :is="to ? RouterLink : 'a'"
    class="cursor-pointer overflow-hidden no-underline hover:underline font-normal truncate whitespace-normal"
    :class="{
      'text-base': !small,
      'text-xs': small,
      [semanticTypeTextStylesMap[semanticType]]: true,
    }"
  >
    <IconLink
      class="inline rounded-lg p-px"
      :class="{
        'square-5 mr-1 -mt-1': !small,
        'square-3.5 mr-0.5 -mt-0.5': small,
        [semanticTypeChipsStylesMap[semanticType]]: true,
      }"
    /><slot>{{ text }}</slot>
  </component>
</template>

<script lang="ts" setup>
import {RouterLink} from 'vue-router'
import IconLink from '@/assets/icons/sax/IconLink.svg?component'
import {SemanticType} from '@/utils/SemanticType'
import {semanticTypeChipsStylesMap, semanticTypeTextStylesMap} from '@/components/Button/models/semanticTypeStylesMap'
import type {LinkProps} from '@/types/types'

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
