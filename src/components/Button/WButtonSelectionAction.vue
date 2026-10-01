<template>
  <component
    v-bind="{
      ...(disabled
        ? {}
        : tag === 'a'
          ? {href, target}
          : to !== undefined
            ? {to, replace, target}
            : {})
    }"
    :is="to !== undefined ? disabled ? 'a' : WRouterLink : tag ?? 'button'"
    :disabled="disabled || disableMessage !== undefined"
    :aria-label="label ?? tooltipText ?? title"
    :aria-busy="loading || undefined"
    class="
      disabled:text-description relative isolate flex
      select-none items-center bg-none
      no-underline outline-none disabled:cursor-not-allowed
    "
    :class="{
      'w-ripple w-ripple-hover before:text-primary dark:before:text-primary-dark hover:text-primary dark:hover:text-primary-dark cursor-pointer': !disabled && !disableMessage && !loading,
      'tone-primary text-tone w-ripple-active': active,
      'text-accent': !active,
      'cursor-not-allowed': disabled || disableMessage,
      'cursor-progress': loading,
    }"
    @click="!disabled && !disableMessage && !loading && $emit('click', $event)"
  >
    <div
      class="h---w-input-height sm-not:px---inner-margin z-10 flex items-center gap-2 px-(--w-list-padding,1rem)" 
      :class="{
        'opacity-0': loading,
      }"
    >
      <component
        :is="icon"
        class="square-[1.25em]"
      />

      <div
        v-if="title"
        class="sm-not:hidden sm-not:in-[.dropdown]:block whitespace-nowrap font-normal"
      >
        {{ title }}
      </div>
    </div>

    <div
      v-if="loading" 
      class="text-description absolute inset-0 z-10 flex items-center justify-center"
    >
      <WSpinner class="square-5" />
    </div>

    <WTooltip
      v-if="disableMessage || tooltipText"
      :text="disableMessage ?? tooltipText"
      top
      static
    >
      <template
        v-if="$slots.tooltip"
        #default
      >
        <slot name="tooltip" />
      </template>
    </WTooltip>

    <WShine v-if="!disabled && !disableMessage && !loading" />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'
import WShine from '@/components/Shine/WShine.vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  /** Text after the icon. Hidden on phones, except in the More menu. */
  title?: string
  /** Name for screen readers. Defaults to `tooltipText`, then `title`. */
  label?: string
  /** Icon of the action. */
  icon: SVGComponent
  /** Disables the action and shows this text in its tooltip, e.g. "No selected items". */
  disableMessage?: string
  /** Disables the action. */
  disabled?: boolean
  /** Marks the action as on, e.g. a filter that is applied. */
  active?: boolean
  /** Shows a spinner over the action and ignores clicks. */
  loading?: boolean
  /** Tooltip text. */
  tooltipText?: string
  /** Router location — renders a router link. Needs vue-router installed in the app. */
  to?: LinkProps['to']
  /** Element rendered without `to`, e.g. `a` for a link with `href`. Defaults to `button`. */
  tag?: keyof HTMLElementTagNameMap
  /** Link URL when `tag` is `a`. */
  href?: string
  /** `target` attribute of the link. */
  target?: '_self' | '_blank' | '_parent' | '_top'
  /** Replaces the current history entry instead of adding one, with `to`. */
  replace?: boolean
}>()

defineEmits<{
  /** The action was clicked, unless it is disabled or loading. */
  (e: 'click', value: MouseEvent): void
}>()

defineSlots<{
  /** Rich content of the tooltip, replacing `disableMessage` or `tooltipText`. */
  tooltip?: () => void
}>()
</script>
