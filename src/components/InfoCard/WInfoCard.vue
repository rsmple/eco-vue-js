<template>
  <div 
    class="p-4 sm-not:-px--inner-margin sm:rounded-3xl flex gap-3.5 leading-7"
    :class="{
      'bg-gray-100 dark:bg-gray-800': !noBg,
    }"
  >
    <IconNegativeInfo
      v-if="!noIcon"
      class="square-8 sm-not:square-7 sm-not:-ml-1 inline-block text-description rotate-180"
    />

    <div class="py-1 text-pretty">
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