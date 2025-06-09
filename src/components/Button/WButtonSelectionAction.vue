<template>
  <button
    :disabled="disabled || disableMessage !== undefined"
    class="
      disabled:text-description relative isolate flex
      select-none items-center justify-center bg-none
      no-underline outline-none disabled:cursor-not-allowed
    "
    :class="{
      'w-ripple w-ripple-hover before:text-primary dark:before:text-primary-dark hover:text-primary dark:hover:text-primary-dark cursor-pointer': !disabled && !disableMessage && !loading,
      'text-primary dark:text-primary-dark': active,
      'text-accent': !active,
      'cursor-not-allowed': disabled || disableMessage,
      'cursor-progress': loading,
    }"
    @click="!disabled && !disableMessage && !loading && $emit('click')"
  >
    <div
      class="-h--w-input-height sm-not:-px--inner-margin z-10 flex items-center justify-center gap-2 px-[--w-list-padding,1rem]" 
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
        class="sm-not:hidden whitespace-nowrap font-normal"
      >
        {{ title }}
      </div>
    </div>

    <WSpinner
      v-if="loading" 
      class="w-spinner-size-5 text-description absolute z-10"
    />

    <WTooltip v-if="disableMessage">
      <div class="whitespace-nowrap">
        {{ disableMessage }}
      </div>
    </WTooltip>
  </button>
</template>

<script lang="ts" setup>
import WSpinner from '@/components/Spinner/WSpinner.vue'
import WTooltip from '@/components/Tooltip/WTooltip.vue'

defineProps<{
  title?: string
  icon: SVGComponent
  disableMessage?: string
  disabled?: boolean
  active?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>
