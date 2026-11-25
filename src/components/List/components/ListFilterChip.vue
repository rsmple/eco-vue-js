<template>
  <div
    class="relative tone-primary flex h-(--w-input-height,2.75rem) max-w-80 select-none items-center rounded-(--w-input-rounded,0.75rem) border border-solid"
    :class="{
      'border-tone-line bg-tone-soft/40': hasValue,
      'border-line bg-surface': !hasValue,
      'outline-solid outline-2 outline-focus/20 border-tone-line': isOpen,
      'min-w-0': shrink,
      'shrink-0': !shrink,
    }"
  >
    <button
      type="button"
      class="flex h-full min-w-0 cursor-pointer items-center gap-1.5 overflow-hidden rounded-inherit pl-3 outline-none disabled:cursor-default"
      :class="isRemovable ? 'pr-1' : 'pr-3'"
      :aria-expanded="isOpen"
      :disabled="disabled"
      @click="$emit('toggle')"
    >
      <component
        :is="icon"
        v-if="icon"
        class="square-[1.25em] shrink-0"
        :class="hasValue ? 'text-tone' : 'text-description'"
      />

      <span
        class="text-accent truncate"
        :class="{'sr-only': summarized}"
      >
        {{ title }}{{ summarized ? ':' : '' }}
      </span>

      <span
        v-if="summarized"
        class="text-tone shrink-100 flex min-w-0 font-semibold"
      >
        <slot />
      </span>

      <span
        v-if="badge"
        class="bg-tone-soft text-tone min-w-[1.75em] shrink-0 rounded-full px-1.5 text-center text-xs/5 font-semibold tabular-nums"
      >
        {{ badge }}
      </span>

      <IconArrow
        v-if="!hasValue"
        class="square-[1em] text-description shrink-0 motion-safe:transition-transform"
        :class="{'rotate-180': isOpen}"
      />
    </button>

    <button
      v-if="isRemovable"
      type="button"
      :aria-label="removeLabel"
      class="text-description hover:text-accent hover:bg-surface-muted square-6 mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-full"
      @click="$emit('remove')"
    >
      <IconClose class="square-[1em]" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'

import IconArrow from '@/assets/icons/IconArrow.svg?component'
import IconClose from '@/assets/icons/IconClose.svg?component'

import {numberFormatter} from '@/utils/utils'

const props = defineProps<{
  title: string | undefined
  icon: SVGComponent | undefined
  /** Shows the default slot, which names the picked values, in place of the title and count. */
  summarized: boolean
  /** Number of picked values, shown when not `summarized`. */
  count: number
  isOpen: boolean
  /** Label of the remove button, which shows when set. */
  removeLabel: string | undefined
  disabled?: boolean
  /** Lets the chip shrink, truncating its values. */
  shrink?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'remove'): void
}>()

const hasValue = computed(() => props.count > 0 || props.summarized)

const badge = computed<string | undefined>(() => {
  if (props.summarized || !props.count) return undefined

  return numberFormatter.format(props.count)
})

const isRemovable = computed(() => props.removeLabel !== undefined)
</script>
