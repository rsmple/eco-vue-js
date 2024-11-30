<template>
  <RouterLink
    :to="to"
    class="
      text-description hover:text-primary-default dark:hover:text-primary-dark flex cursor-pointer select-none
      items-center gap-2 self-end py-2 text-base font-normal no-underline
    "
  >
    <slot>
      {{ text }}
    </slot>
    <IconBack class="rotate-180" />
  </RouterLink>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import {RouterLink} from 'vue-router'

import IconBack from '@/assets/icons/default/IconBack.svg?component'

interface Props extends LinkProps {
  text?: string
}

defineProps<Props>()
</script>
