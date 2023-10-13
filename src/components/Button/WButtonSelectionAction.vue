<template>
  <div class="border-r border-solid border-gray-300 dark:border-gray-700 last:border-r-0">
    <button
      :disabled="disableMessage !== undefined"
      class="
        relative h-9 flex gap-2 px-5 sm:px-[1.125rem] items-center
        select-none cursor-pointer no-underline outline-none border-none bg-none
        disabled:text-description disabled:cursor-not-allowed
      "
      :class="{
        'w-ripple w-ripple-hover before:text-primary-default dark:before:text-primary-dark hover:text-primary-default dark:hover:text-primary-dark': !disableMessage,
        'text-primary-default dark:text-primary-dark': active,
        'text-accent': !active,
      }"
      @click="$emit('click')"
    >
      <component :is="icon" />

      <div class="whitespace-nowrap font-normal text-base sm-not:hidden">
        {{ title }}
      </div>
    </button>

    <WTooltip v-if="disableMessage">
      <div class="whitespace-nowrap">
        {{ disableMessage }}
      </div>
    </WTooltip>
  </div>
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
