<template>
  <component
    :is="to !== undefined ? RouterLink : tag"
    v-bind="to !== undefined ? {to} : undefined"
    class="
      w-ripple w-ripple-hover relative grid w-full cursor-pointer select-none justify-items-center gap-1 py-2
    "
    :class="{
      'text-primary-default dark:text-primary-dark': active && semanticType === SemanticType.SECONDARY,
      [outline ? semanticTypeOutlineStylesMap[semanticType] : semanticTypeStylesMap[semanticType]]: true,
    }"
    @click="$emit('click', $event)"
  >
    <WCounter
      v-if="count !== undefined"
      v-show="count > 0"
      class="absolute left-[calc(50%-20px)] top-0 text-xs"
      :count="count"
      :trigger="1"
    />

    <slot name="icon">
      <template v-if="icon">
        <component
          :is="icon"
          class="square-6"
        />
      </template>
    </slot>

    <div class="whitespace-nowrap text-center text-xs font-normal">
      {{ title }}
    </div>
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import WCounter from '@/components/Counter/WCounter.vue'

import {SemanticType} from '@/utils/SemanticType'

const semanticTypeStylesMap: Record<SemanticType, string> = {
  [SemanticType.SECONDARY]: 'text-description bg-default dark:bg-default-dark hover:text-primary-default dark:hover:text-primary-dark',
  [SemanticType.PRIMARY]: 'text-default bg-primary-default dark:bg-primary-dark',
  [SemanticType.POSITIVE]: 'text-default dark:text-default-dark bg-positive dark:bg-positive-dark',
  [SemanticType.WARNING]: 'text-default dark:text-default-dark bg-warning dark:bg-warning-dark',
  [SemanticType.NEGARIVE]: 'text-default dark:text-default-dark bg-negative dark:bg-negative-dark',
  [SemanticType.INFO]: 'text-default dark:text-default-dark bg-info dark:bg-info-dark',
}

const semanticTypeOutlineStylesMap: Record<SemanticType, string> = {
  [SemanticType.SECONDARY]: 'text-description bg-default dark:bg-default-dark hover:text-primary-default dark:hover:text-primary-dark',
  [SemanticType.PRIMARY]: 'text-primary-default text-primary-dark',
  [SemanticType.POSITIVE]: 'text-positive dark:text-positive-dark',
  [SemanticType.WARNING]: 'text-warning dark:text-warning-dark',
  [SemanticType.NEGARIVE]: 'text-negative dark:text-negative-dark',
  [SemanticType.INFO]: 'text-info dark:text-info-dark',
}

interface Props extends Partial<LinkProps> {
  icon?: SVGComponent
  title: string
  active?: boolean
  tag?: 'button' | 'a'
  count?: number
  semanticType?: SemanticType
  outline?: boolean
}

withDefaults(
  defineProps<Props>(),
  {
    icon: undefined,
    tag: 'button',
    to: undefined,
    count: undefined,
    semanticType: SemanticType.SECONDARY,
  },
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>
