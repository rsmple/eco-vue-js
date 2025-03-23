<template>
  <component
    :is="to !== undefined ? disabled || skeleton ? 'a' : RouterLink : tag"
    v-bind="to !== undefined && !disabled && !skeleton ? {to} : undefined"
    class="w-ripple-trigger group block h-[3.25rem] w-full px-1 py-0.5"
    :class="{
      'cursor-not-allowed opacity-50': disabled,
      'cursor-progress': skeleton,
    }"
    :disabled="disabled || skeleton"
    @click="!disabled && !skeleton && $emit('click', $event)"
  >
    <WSkeleton
      v-if="skeleton"
      class="w-skeleton-w-full w-skeleton-h-auto w-skeleton-rounded-full aspect-square"
    />

    <div
      v-else
      class="relative grid aspect-square w-full select-none items-center justify-center gap-1 rounded-full bg-[200%_auto] [background-position:right]"
      :class="{
        'w-ripple w-ripple-hover cursor-pointer': !disabled && !skeleton,
        'text-primary dark:text-primary-dark': active && semanticType === SemanticType.SECONDARY,
        [semanticTypeBackgroundMap[semanticType]]: true,
      }"
    >
      <WCounter
        v-if="count !== undefined"
        v-show="count > 0"
        class="absolute left-0 top-0 text-xs"
        :count="count"
        :trigger="1"
      />

      <slot name="icon">
        <template v-if="icon">
          <component
            :is="icon"
            class="square-6 w-svg-stroke-width-sm transition-transform"
            :class="{
              'group-hover:scale-120': !disabled,
            }"
          />
        </template>
      </slot>

      <WShine v-if="!disabled && !isBackdrop" />
    </div>

    <WTooltip
      v-if="tooltipText || title"
      :text="tooltipText ?? title"
      left
    />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import WCounter from '@/components/Counter/WCounter.vue'
import WShine from '@/components/Shine/WShine.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {useIsBackdrop} from '@/components/Modal/use/useIsBackdrop'
import {SemanticType, useSemanticTypeBackgroundMap} from '@/utils/SemanticType'

interface Props extends Partial<LinkProps> {
  icon?: SVGComponent
  title: string
  active?: boolean
  tag?: 'button' | 'a'
  count?: number
  semanticType?: SemanticType
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
    tooltipText: undefined,
    semanticTypeMap: undefined,
  },
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()
const isBackdrop = useIsBackdrop()
</script>
