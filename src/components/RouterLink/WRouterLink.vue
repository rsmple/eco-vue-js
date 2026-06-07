<template>
  <component
    :is="RouterLinkComponent ?? 'a'"
    v-bind="to ? { to } : { href }"
  >
    <slot />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'
import type {RouterLink} from 'vue-router'

import {resolveComponent} from 'vue'

interface Props extends LinkProps {
  href?: string
}

defineProps<Props>()

let RouterLinkComponent: typeof RouterLink | null = null
try {
  RouterLinkComponent = resolveComponent('RouterLink') as unknown as typeof RouterLink
} catch {
  RouterLinkComponent = null
}
</script>