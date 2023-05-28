<template>
  <div class="relative height-52 width-44 flex flex-col gap-2">
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

    <div class="text-base text-accent text-center font-normal truncate">
      {{ name }}
    </div>

    <button
      class="absolute top-0 right-0 w-ripple flex square-5 rounded-full items-center justify-center hover:bg-opacity-5 hover:bg-black-default outline-none"
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
