<template>
  <component
    :is="disabled || loading ? 'div' : to ? WRouterLink : href ? 'a' : 'button'"
    v-bind="disabled || loading ? undefined : to ? {to} : href ? {href, download} : undefined"
    class="w-ripple-trigger relative block w-full select-none items-center justify-start px-2 text-start outline-none first:pt-2 last:pb-2"
    :class="{
      [semanticTypeTextMap[semanticType]]: toned && !disabled,
      'tone-primary': !toned,
      'hover:text-tone cursor-pointer': !disabled && !loading,
      'cursor-not-allowed opacity-50': disabled,
      'text-tone': active && !disabled,
      'text-description': (!active && !toned) || disabled,
      'cursor-progress': loading,
    }"
    :disabled="disabled"
    @click="!disabled && !loading && $emit('click', $event)"
  >
    <div
      class="relative grid w-full rounded-lg px-2 py-1 transition-opacity"
      :class="{
        'w-ripple w-ripple-hover': !disabled,
        'before:opacity-10': active && !disabled,
        'grid-cols-[1fr_1.25rem] gap-4': active !== undefined,
        'grid-cols-[1fr]': active === undefined,
        'opacity-0': loading,
      }"
    >
      <div class="flex items-center gap-4">
        <slot />
      </div>

      <div
        v-if="active"
        class="flex h-full items-center"
      >
        <IconCheck class="square-[1.25em]" />
      </div>
    </div>

    <Transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center"
      >
        <WSpinner class="square-[1.25em]" />
      </div>
    </Transition>

    <WTooltip
      v-if="tooltipText"
      :text="tooltipText"
      left
    />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {computed} from 'vue'

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

import IconCheck from '@/assets/icons/IconCheck.svg?component'

import {SemanticType, useSemanticTypeTextMap} from '@/utils/SemanticType'

import WSpinner from '../Spinner/WSpinner.vue'

interface Props extends Partial<LinkProps> {
  /** Grays the item out and ignores clicks. */
  disabled?: boolean
  /** URL of a plain link, when there is no `to`. */
  href?: string
  /** `download` attribute of the `href` link — the file name to save it as. */
  download?: string
  /** Marks the item as picked, with primary text and a check. `false` leaves room for the check, to line up with picked items. */
  active?: boolean
  /** Tooltip text on the left of the item. */
  tooltipText?: string
  /** Shows a spinner over the item and ignores clicks. */
  loading?: boolean
  /** Color of the item. Types other than `primary` and `secondary` color the text at rest — a red "Delete". */
  semanticType?: SemanticType
}

const props = withDefaults(
  defineProps<Props>(),
  {
    active: undefined,
    semanticType: SemanticType.PRIMARY,
    download: undefined,
    href: undefined,
    tooltipText: undefined,
  },
)

defineEmits<{
  /** The item was clicked, unless it is disabled or loading. */
  (e: 'click', value: MouseEvent): void
}>()

defineSlots<{
  /** Content of the item, laid out in a row. */
  default?: () => void
}>()

const semanticTypeTextMap = useSemanticTypeTextMap()

const toned = computed(() => props.semanticType !== SemanticType.PRIMARY && props.semanticType !== SemanticType.SECONDARY)
</script>