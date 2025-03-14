<template>
  <button
    :disabled="disabled || disableMessage !== undefined"
    class="
      disabled:text-description
      relative cursor-pointer select-none bg-none no-underline
      outline-none disabled:cursor-not-allowed
    "
    :class="{
      'w-ripple w-ripple-hover before:text-primary-default dark:before:text-primary-dark hover:text-primary-default dark:hover:text-primary-dark': !disabled && !disableMessage,
      'text-primary-default dark:text-primary-dark': active,
      'text-accent': !active,
    }"
    @click="$emit('click')"
  >
    <div class="-h--w-input-height sm-not:-px--inner-margin flex items-center gap-2 px-[--w-list-padding,1rem]">
      <component
        :is="icon"
        class="square-[1.25em]"
      />

      <div
        v-if="title"
        class="sm-not:hidden whitespace-nowrap font-normal"
      >
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
  title?: string
  icon: SVGComponent
  disableMessage?: string
  disabled?: boolean
  active?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>
