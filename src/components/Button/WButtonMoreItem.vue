<template>
  <WMenuItem
    :to="to"
    :href="href"
    :download="download"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <div class="min-w-20 flex-1 text-start">
      {{ text }}
    </div>

    <slot name="icon">
      <template v-if="icon">
        <component
          :is="icon"
          class="square-[1.25em]"
        />
      </template>
    </slot>
  </WMenuItem>
</template>

<script lang="ts" setup>
import type {LinkProps} from '@/types/types'

import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

interface Props extends Partial<LinkProps> {
  text: string
  icon?: SVGComponent
  disabled?: boolean
  href?: string
  download?: string
}

defineProps<Props>()

defineEmits<{
  (e: 'click', value: MouseEvent): void
}>()
</script>