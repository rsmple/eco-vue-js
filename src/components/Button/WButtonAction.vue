<template>
  <component
    :is="to !== undefined ? disabled || skeleton ? 'a' : WRouterLink : tag"
    v-bind="disabled || skeleton ? undefined : to !== undefined ? {to} : tag === 'a' ? {href, target, rel} : undefined"
    class="w-ripple-trigger group grid w-full grid-cols-1 py-1"
    :class="{
      'cursor-not-allowed opacity-50': disabled,
      'cursor-progress': skeleton,
    }"
    :disabled="disabled || skeleton"
    :aria-label="titleText ? undefined : title"
    @click="handleClick"
  >
    <WSkeleton
      v-if="skeleton"
      class="w-skeleton-w-auto w-skeleton-h-auto w-skeleton-rounded-(--w-button-action-rounded,9999px) mx-1 aspect-square"
    />

    <div
      v-else
      class="relative mx-1 grid aspect-square select-none gap-1 rounded-(--w-button-action-rounded,9999px) bg-size-[200%_auto] bg-right"
      :class="{
        'w-ripple w-ripple-hover cursor-pointer': !disabled && !skeleton,
        'tone-primary text-tone': active && semanticType === SemanticType.SECONDARY,
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
            class="square-6 w-svg-stroke-width-sm place-self-center transition-transform"
            :class="{
              'group-hover:scale-120': !disabled,
            }"
          />
        </template>
      </slot>

      <WShine v-if="!disabled && !isBackdrop && !loading" />

      <div
        v-if="loading"
        class="absolute inset-0 rounded-inherit overflow-clip text-primary-darkest/10 dark:text-primary-light/20"
      >
        <div class="absolute inset-0 bg-linear-90 from-current/0 to-current/0 via-current animate-ticker" />
      </div>
    </div>

    <div
      v-if="titleText"
      class="text-3xs mt-1 text-center"
      :class="{
        'self-center': !skeleton,
      }"
    >
      <WSkeleton v-if="skeleton" />

      <template v-else>
        {{ title }}
      </template>
    </div>

    <WTooltip
      v-if="tooltipText || (!titleText && title)"
      ref="tooltip"
      :text="tooltipText ?? (titleText ? undefined : title)"
      left
    />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {useTemplateRef} from 'vue'

import WCounter from '@/components/Counter/WCounter.vue'
import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WShine from '@/components/Shine/WShine.vue'
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import {useIsBackdrop} from '@/components/Modal/use/useIsBackdrop'
import {SemanticType, useSemanticTypeBackgroundMap} from '@/utils/SemanticType'

interface Props extends Partial<LinkProps> {
  /** Icon of the button. The `icon` slot replaces it. */
  icon?: SVGComponent
  /** Name of the action, shown in a tooltip — or under the icon with `titleText` — and read by screen readers. */
  title: string
  /** Colors the icon primary, for a toggle that is on. Only with the default `SECONDARY` type. */
  active?: boolean
  /** Element rendered without `to`: a `button`, or an `a` for an external link with `href`. */
  tag?: 'button' | 'a'
  /** Link target when `tag` is `a`. */
  href?: string
  /** `target` attribute of the link when `tag` is `a`. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** `rel` attribute of the link when `tag` is `a`. */
  rel?: string
  /** Number in a badge on the corner, hidden at 0. */
  count?: number
  /** Color scheme of the button. */
  semanticType?: SemanticType
  /** Grays the button out and ignores clicks. */
  disabled?: boolean
  /** Shows a placeholder instead of the button and ignores clicks. */
  skeleton?: boolean
  /** Tooltip text instead of `title`. */
  tooltipText?: string
  /** Shows `title` under the icon instead of in the tooltip. */
  titleText?: boolean
  /** Runs a shimmer over the button while its action is in progress. */
  loading?: boolean
}

const props = withDefaults(
  defineProps<Props>(),
  {
    icon: undefined,
    tag: 'button',
    href: undefined,
    target: undefined,
    rel: undefined,
    to: undefined,
    count: undefined,
    semanticType: SemanticType.SECONDARY,
    tooltipText: undefined,
    disabled: undefined,
    skeleton: undefined,
  },
)

const emit = defineEmits<{
  /** The button was clicked, unless it is disabled or a skeleton. */
  (e: 'click', event: MouseEvent): void
}>()

defineSlots<{
  /** Content of the button, replacing `icon`. */
  icon?: () => void
}>()

const semanticTypeBackgroundMap = useSemanticTypeBackgroundMap()
const isBackdrop = useIsBackdrop()
const tooltipRef = useTemplateRef('tooltip')

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.skeleton) return

  tooltipRef.value?.close()
  emit('click', event)
}
</script>
