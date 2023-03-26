<template>
  <div class="relative height-52 width-44 flex flex-col gap-2">
    <slot />

    <button
      class="absolute top-0 right-0 w-ripple flex square-5 rounded-full items-center justify-center hover:bg-opacity-5 hover:bg-black-default"
      @click.stop.prevent="$emit('click:cancel')"
    >
      <IconCancel class="square-3 text-description" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'

defineEmits<{
  (e: 'click:cancel'): void
}>()

</script>
