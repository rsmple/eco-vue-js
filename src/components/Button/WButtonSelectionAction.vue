<template>
  <button
    :disabled="disableMessage !== undefined"
    class="
      disabled:text-description
      relative cursor-pointer select-none bg-none no-underline
      outline-none disabled:cursor-not-allowed
    "
    :class="{
      'w-ripple w-ripple-hover before:text-primary-default dark:before:text-primary-dark hover:text-primary-default dark:hover:text-primary-dark': !disableMessage,
      'text-primary-default dark:text-primary-dark': active,
      'text-accent': !active,
    }"
    @click="$emit('click')"
  >
    <div class="flex h-9 items-center gap-2 px-5 sm:px-[1.125rem]">
      <component :is="icon" />

      <div class="sm-not:hidden whitespace-nowrap text-base font-normal">
        {{ title }}
      </div>
    </div>

    <WTooltip v-if="disableMessage">
      <div class="whitespace-nowrap">
        {{ disableMessage }}
      </div>
    </WTooltip>
  </button>
</template>

<script lang="ts" setup>
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  title: string
  icon: SVGComponent
  disableMessage?: string
  active?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>
