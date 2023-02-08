<template>
  <component
    v-bind="!to ? {target, href} : {}"
    :is="to ? RouterLink : 'a'"
    :to="to"
    class="
      cursor-pointer text-primary-default dark:text-primary-dark overflow-hidden
      no-underline hover:underline text-base font-normal truncate whitespace-normal
    "
  >
    <span class="inline mr-1">
      <IconLink
        class="inline -mt-1 square-5 bg-primary-default dark:bg-primary-dark bg-opacity-95 rounded-lg text-default dark:text-default-dark p-[1px]"
      />
    </span>

    <slot>
      {{ text }}
    </slot>
  </component>
</template>

<script lang="ts" setup>
import {RouterLink, type RouteLocationRaw} from 'vue-router'
import IconLink from '@/assets/icons/sax/IconLink.svg?component'

defineProps<{
  to?: RouteLocationRaw
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  text?: string
}>()

</script>
