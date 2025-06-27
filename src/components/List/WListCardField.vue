<template>
  <div
    class="list:last-not:pr-3 list:first-not:pl-3 grid shrink-0 grid-cols-1"
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
  modelValue?: string | number
  skeleton?: boolean
  allowOpen?: boolean
  noPadding?: boolean
}>()
</script>
