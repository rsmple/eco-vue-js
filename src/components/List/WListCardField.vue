<template>
  <div class="grid grid-cols-1 items-center sm:h-16 sm:pr-6">
    <WSkeleton v-if="skeleton" />

    <template v-else>
      <slot>
        <div class="truncate">
          <slot name="inner">
            {{ modelValue }}
          </slot>

          <WTooltip
            no-touch
            overflow-only
          >
            <div class="min-w-[12rem] max-w-xl overflow-hidden">
              <slot name="inner">
                {{ modelValue }}
              </slot>
            </div>
          </WTooltip>
        </div>
      </slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import WSkeleton from '@/components/Skeleton/WSkeleton.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  modelValue?: string | number
  skeleton?: boolean
}>()

</script>
