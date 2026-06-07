<template>
  <div class="height-52 grid justify-items-center gap-2">
    <div class="square-44 relative flex items-center justify-center">
      <slot
        v-if="!hasError"
        name="positive"
      >
        <IconCheckCircle class="square-36 text-positive dark:text-positive-dark" />
      </slot>
  
      <slot
        v-else
        name="negative"
      >
        <IconCloseCircle class="square-36 text-negative dark:text-negative-dark" />
      </slot>

      <button
        class="w-ripple square-5 hover:bg-black-default absolute right-0 top-0 flex items-center justify-center rounded-full outline-none hover:bg-opacity-5"
        aria-label="Remove file"
        @click.stop.prevent="$emit('click:cancel')"
      >
        <IconCancel class="square-3 text-description" />
      </button>
    </div>

    <div class="text-accent truncate text-center font-normal">
      {{ name }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconCancel from '@/assets/icons/IconCancel.svg?component'
import IconCheckCircle from '@/assets/icons/IconCheckCircle.svg?component'
import IconCloseCircle from '@/assets/icons/IconCloseCircle.svg?component'

defineProps<{
  name?: string
  hasError?: boolean
}>()

defineEmits<{
  (e: 'click:cancel'): void
}>()
</script>
