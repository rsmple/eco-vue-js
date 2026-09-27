<template>
  <div
    class="list:pr-3 list:first-not:pl-3 grid shrink-0 grid-cols-1"
    :class="{
      'pointer-events-none': allowOpen,
    }"
  >
    <WSkeleton v-if="skeleton" />

    <template v-else>
      <slot>
        <div class="truncate">
          <slot name="inner">
            {{ modelValue }}
          </slot>
        </div>
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

defineProps<{
  /** Value shown as truncated text. The `inner` and `default` slots replace it. */
  modelValue?: string | number
  /** Shows a placeholder instead of the content. */
  skeleton?: boolean
  /** Lets clicks through to the row, so they open its expansion. */
  allowOpen?: boolean
}>()

defineSlots<{
  /** Replaces the whole content, including the truncating wrapper. */
  default?: () => void
  /** Replaces `modelValue` inside the truncating wrapper. */
  inner?: () => void
}>()
</script>
