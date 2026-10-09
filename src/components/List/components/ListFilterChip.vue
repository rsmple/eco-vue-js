<template>
  <div
    class="relative tone-primary flex h-(--w-input-height,2.75rem) max-w-80 shrink-0 select-none items-center rounded-(--w-input-rounded,0.75rem) border border-solid"
    :class="{
      'border-tone-line bg-tone-soft/40': hasValue,
      'border-line bg-surface': !hasValue,
      'outline-solid outline-2 outline-focus/20 border-tone-line': isOpen,
    }"
  >
    <button
      type="button"
      class="flex h-full min-w-0 cursor-pointer items-center gap-1.5 rounded-inherit pl-3 outline-none disabled:cursor-default"
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
        class="whitespace-nowrap"
        :class="valuesShown.length ? 'text-description' : 'text-accent'"
      >
        {{ title }}{{ valuesShown.length ? ':' : '' }}
      </span>

      <span
        v-if="valuesShown.length"
        :title="valueList.join(', ')"
        class="text-tone truncate font-semibold"
      >
        {{ valuesShown.join(', ') }}
      </span>

      <span
        v-if="badge"
        class="bg-tone-soft text-tone min-w-[1.75em] shrink-0 rounded-full px-1.5 text-center text-xs/5 font-semibold tabular-nums"
      >
        {{ badge }}
      </span>

      <IconArrow
        v-if="!hasValue"
        class="square-[1em] text-description shrink-0 transition-transform"
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

const VALUES_SHOWN = 2

const props = defineProps<{
  title: string | undefined
  icon: SVGComponent | undefined
  /** Picked values to name, from the filter's `summary`. */
  values: string[] | undefined
  /** Number of picked values, for a filter without `summary`. */
  count: number
  isOpen: boolean
  /** Label of the remove button, which shows when set. */
  removeLabel: string | undefined
  disabled?: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
  (e: 'remove'): void
}>()

const valueList = computed(() => props.values ?? [])

const valuesShown = computed(() => valueList.value.slice(0, VALUES_SHOWN))

const hasValue = computed(() => props.count > 0 || valueList.value.length > 0)

const badge = computed<string | undefined>(() => {
  if (props.values) return valueList.value.length > VALUES_SHOWN ? `+${ valueList.value.length - VALUES_SHOWN }` : undefined

  return props.count ? numberFormatter.format(props.count) : undefined
})

const isRemovable = computed(() => props.removeLabel !== undefined)
</script>
