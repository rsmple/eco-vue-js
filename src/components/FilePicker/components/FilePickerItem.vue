<template>
  <div class="height-52 width-44 relative flex flex-col gap-2">
    <div
      v-if="!hasError"
      class="square-44 flex items-center justify-center"
    >
      <slot name="positive">
        <IconCheckCircle class="square-36 text-positive dark:text-positive-dark" />
      </slot>
    </div>

    <div
      v-else
      class="square-44 flex items-center justify-center"
    >
      <slot name="negative">
        <IconCloseCircle class="square-36 text-negative dark:text-negative-dark" />
      </slot>
    </div>

    <div class="text-accent truncate text-center text-base font-normal">
      {{ name }}
    </div>

    <button
      class="w-ripple square-5 hover:bg-black-default absolute right-0 top-0 flex items-center justify-center rounded-full outline-none hover:bg-opacity-5"
      @click.stop.prevent="$emit('click:cancel')"
    >
      <IconCancel class="square-3 text-description" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import IconCheckCircle from '@/assets/icons/sax/IconCheckCircle.svg?component'
import IconCloseCircle from '@/assets/icons/sax/IconCloseCircle.svg?component'

defineProps<{
  name?: string
  hasError?: boolean
}>()

defineEmits<{
  (e: 'click:cancel'): void
}>()
</script>
