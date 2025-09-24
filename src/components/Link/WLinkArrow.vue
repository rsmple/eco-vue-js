<template>
  <WRouterLink
    :to="to"
    class="
      text-description hover:text-primary dark:hover:text-primary-dark flex cursor-pointer select-none
      items-center gap-2 self-end py-2 font-normal no-underline
    "
  >
    <slot>
      {{ text }}
    </slot>
    <IconBack class="square-[1.25em] rotate-180" />
  </WRouterLink>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import WRouterLink from '@/components/RouterLink/WRouterLink.vue'

import IconBack from '@/assets/icons/IconBack.svg?component'

interface Props extends LinkProps {
  text?: string
}

defineProps<Props>()
</script>
