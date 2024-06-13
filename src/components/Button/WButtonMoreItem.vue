<template>
  <WMenuItem
    :to="to"
    :href="href"
    :download="download"
    :disabled="disabled"
  >
    <div class="min-w-[5rem] flex-1 text-start">
      {{ text }}
    </div>

    <slot name="icon">
      <template v-if="icon">
        <component :is="icon" />
      </template>
    </slot>
  </WMenuItem>
</template>

<script lang="ts" setup>
import WMenuItem from '@/components/MenuItem/WMenuItem.vue'

interface Props extends /* @vue-ignore */ Partial<LinkProps> {
  text: string
  icon?: SVGComponent
  disabled?: boolean
  href?: string
  download?: string
}

defineProps<Props>()

</script>