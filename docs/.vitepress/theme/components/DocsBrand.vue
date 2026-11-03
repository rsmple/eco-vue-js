<template>
  <a
    :href="withBase('/')"
    :aria-label="site.title"
    class="flex items-center gap-2.5 no-underline relative"
    :class="{'w-ripple w-ripple-hover rounded-(--w-nav-item-rounded) px-2 py-1.5': compact}"
  >
    <IconLogo class="size-8 tone-primary text-tone-fill" />

    <span class="leading-none">
      <span class="text-accent text-xl font-semibold tracking-tight sm:text-2xl leading-none">EcoVue</span>
      <span
        v-if="!compact"
        class="text-description mx-4 hidden text-base font-medium tracking-[0.2em] uppercase lg:inline"
      >UI Library</span>
    </span>
  </a>
</template>

<script lang="ts" setup>
import {useData, withBase} from 'vitepress'

import IconLogo from '../../../public/logo.svg?component'

defineProps<{
  /** For the nav's top row: without the "UI Library" tagline, filling the row as a nav item does. */
  compact?: boolean
}>()

const {site} = useData()
</script>
