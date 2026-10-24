<template>
  <div
    role="heading"
    aria-level="3"
    class="
      bg-surface list:left---left-inner list:w---width-inner sm-not:px---inner-margin
      list:pt-2 z-2 col-span-full pb-2 sm:sticky sm:px-(--w-list-padding,1rem)
    "
    :style="{top: `calc(var(--header-height,0px) + ${ headerHeight ?? 0 }px)`}"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {inject} from 'vue'

import {wInfiniteListHeaderHeight} from '@/components/InfiniteList/models/injection'

// Read here and not in the list's row slot, so a new header height re-renders only the headings.
const headerHeight = inject(wInfiniteListHeaderHeight, null)
</script>
