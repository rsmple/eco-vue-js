<template>
  <component
    v-bind="!to ? {target, href} : {}"
    :is="to ? RouterLink : 'a'"
    :to="to"
    class="cursor-pointer overflow-hidden no-underline hover:underline font-normal truncate whitespace-normal"
    :class="{
      'text-base': !small,
      'text-xs': small,
      [semanticTypeTextStylesMap[semanticType]]: true,
    }"
  >
    <span class="inline mr-1">
      <IconLink
        class="inline -mt-1 rounded-lg p-[1px]"
        :class="{
          'square-5': !small,
          'square-3': small,
          [semanticTypeIconStylesMap[semanticType]]: true,
        }"
      />
    </span>

    <slot>
      {{ text }}
    </slot>
  </component>
</template>

<script lang="ts" setup>
import {RouterLink, type RouteLocationRaw} from 'vue-router'
import IconLink from '@/assets/icons/sax/IconLink.svg?component'
import {SemanticType} from '@/utils/SemanticType'
import {semanticTypeIconStylesMap, semanticTypeTextStylesMap} from '@/components/Button/models/semanticTypeStylesMap'

withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    href?: string
    target?: '_self' | '_blank' | '_parent' | '_top'
    text?: string
    semanticType?: SemanticType
    small?: boolean
  }>(),
  {
    semanticType: SemanticType.PRIMARY,
    to: undefined,
    href: undefined,
    target: undefined,
    text: undefined,
  },
)

</script>
