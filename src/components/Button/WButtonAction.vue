<template>
  <component
    :is="to !== undefined ? disabled || skeleton ? 'a' : RouterLink : tag"
    v-bind="to !== undefined && !disabled && !skeleton ? {to} : undefined"
    class="relative grid w-full select-none justify-items-center gap-1 py-2"
    :class="{
      'text-primary-default dark:text-primary-dark': active && semanticType === SemanticType.SECONDARY,
      [skeleton || disabled ? semanticTypeStylesMap[SemanticType.SECONDARY] : outline ? semanticTypeOutlineStylesMap[semanticType] : semanticTypeStylesMap[semanticType]]: true,
      'cursor-not-allowed opacity-50': disabled,
      'w-ripple w-ripple-hover cursor-pointer': !disabled && !skeleton,
      'cursor-progress': skeleton,
    }"
    :disabled="disabled || skeleton"
    @click="!disabled && !skeleton && $emit('click', $event)"
  >
    <WCounter
      v-if="count !== undefined"
      v-show="count > 0"
      class="absolute left-[calc(50%-20px)] top-0 text-xs"
      :count="count"
      :trigger="1"
    />

    <WSkeleton
      v-if="skeleton"
      class="w-skeleton-h-6 w-skeleton-w-6 w-skeleton-rounded-full"
    />

    <slot
      v-else
      name="icon"
    >
      <template v-if="icon">
        <component
          :is="icon"
          class="square-6"
        />
      </template>
    </slot>

    <div class="whitespace-nowrap text-center text-xs font-normal">
      <WSkeleton
        v-if="skeleton"
        class="min-w-10"
      />

      <template v-else>
        {{ title }}
      </template>
    </div>

    <WTooltip
      v-if="tooltipText"
      :text="tooltipText"
      left
    />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import WCounter from '@/components/Counter/WCounter.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import {SemanticType} from '@/utils/SemanticType'

import WTooltip from '../Tooltip/WTooltip.vue'

const semanticTypeStylesMap: Record<SemanticType, string> = {
  [SemanticType.SECONDARY]: 'text-description bg-default dark:bg-default-dark [not:(:disabled)]:hover:text-primary-default [not:(:disabled)]:dark:hover:text-primary-dark',
  [SemanticType.PRIMARY]: 'text-default bg-primary-default dark:bg-primary-dark',
  [SemanticType.POSITIVE]: 'text-default dark:text-default-dark bg-positive dark:bg-positive-dark',
  [SemanticType.WARNING]: 'text-default dark:text-default-dark bg-warning dark:bg-warning-dark',
  [SemanticType.NEGARIVE]: 'text-default dark:text-default-dark bg-negative dark:bg-negative-dark',
  [SemanticType.INFO]: 'text-default dark:text-default-dark bg-info dark:bg-info-dark',
}

const semanticTypeOutlineStylesMap: Record<SemanticType, string> = {
  [SemanticType.SECONDARY]: 'text-description bg-default dark:bg-default-dark [not:(:disabled)]:hover:text-primary-default [not:(:disabled)]:dark:hover:text-primary-dark',
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
  disabled?: boolean
  skeleton?: boolean
  tooltipText?: string
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
