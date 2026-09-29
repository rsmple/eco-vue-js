<template>
  <component
    :is="to && RouterLinkComponent ? RouterLinkComponent : 'a'"
    v-bind="to && RouterLinkComponent ? { to } : { href }"
  >
    <slot />
  </component>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'
import type {RouterLink} from 'vue-router'

import {getCurrentInstance} from 'vue'

interface Props extends LinkProps {
  /** URL of a plain link, used when `to` is empty. */
  href?: string
}

defineProps<Props>()

defineSlots<{
  /** Content of the link. */
  default?: () => void
}>()

// Registered by vue-router's plugin. Without it, links render as plain `a` elements.
const RouterLinkComponent = getCurrentInstance()?.appContext.components.RouterLink as typeof RouterLink | undefined
</script>