<template>
  <div class="flex items-center sm:h-16">
    <div class="w-full relative">
      <WSkeleton v-if="skeleton" />

      <template v-else>
        <slot>
          &nbsp;
          <div class="absolute top-0 w-full truncate">
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
