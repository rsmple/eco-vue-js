<template>
  <div 
    class="sm-not:-px--inner-margin flex gap-3.5 p-4 leading-7 sm:rounded-3xl"
    :class="{
      'bg-gray-100 dark:bg-gray-800': !noBg,
    }"
  >
    <IconNegativeInfo
      v-if="!noIcon"
      class="square-8 sm-not:square-7 sm-not:-ml-1 text-description inline-block rotate-180"
    />

    <div class="text-pretty py-1">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconNegativeInfo from '@/assets/icons/sax/IconNegativeInfo.svg?component'

defineProps<{
  noBg?: boolean
  noIcon?: boolean
}>()
</script>