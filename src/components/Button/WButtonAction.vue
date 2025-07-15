<template>
  <component
    :is="to !== undefined ? isDisabled || isSkeleton ? 'a' : RouterLink : tag"
    v-bind="to !== undefined && !isDisabled && !isSkeleton ? {to} : undefined"
    class="w-ripple-trigger group grid w-full grid-cols-1 py-1"
    :class="{
      'cursor-not-allowed opacity-50': isDisabled,
      'cursor-progress': isSkeleton,
    }"
    :disabled="isDisabled || isSkeleton"
    @click="!isDisabled && !isSkeleton && $emit('click', $event)"
  >
    <WSkeleton
      v-if="isSkeleton"
      class="w-skeleton-w-auto w-skeleton-h-auto w-skeleton-rounded-full mx-1 aspect-square"
    />

    <div
      v-else
      class="relative mx-1 grid aspect-square select-none items-center justify-center gap-1 rounded-full bg-[200%_auto] [background-position:right]"
      :class="{
        'w-ripple w-ripple-hover cursor-pointer': !isDisabled && !isSkeleton,
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
              'group-hover:scale-120': !isDisabled,
            }"
          />
        </template>
      </slot>

      <WShine v-if="!isDisabled && !isBackdrop" />
    </div>

    <div
      v-if="titleText"
      class="text-3xs mt-1 text-center"
      :class="{
        'self-center': !isSkeleton,
      }"
    >
      <WSkeleton v-if="isSkeleton" />

      <template v-else>
        {{ title }}
      </template>
    </div>

    <WTooltip
      v-if="tooltipText || (!titleText && title)"
      :text="tooltipText ?? (titleText ? undefined : title)"
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
import {useComponentStatesButton} from '@/utils/useComponentStates'

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
  titleText?: boolean
}

const props = withDefaults(
  defineProps<Props>(),
  {
    icon: undefined,
    tag: 'button',
    to: undefined,
    count: undefined,
    semanticType: SemanticType.SECONDARY,
    tooltipText: undefined,
    semanticTypeMap: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const {isDisabled, isSkeleton} = useComponentStatesButton(props)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()
const isBackdrop = useIsBackdrop()
</script>
