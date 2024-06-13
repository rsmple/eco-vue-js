<template>
  <RouterLink
    :to="to"
    class="
      py-2 text-description text-base font-normal cursor-pointer select-none
      self-end no-underline hover:text-primary-default dark:hover:text-primary-dark flex gap-2 items-center
    "
  >
    <slot>
      {{ text }}
    </slot>
    <IconBack class="rotate-180" />
  </RouterLink>
</template>

<script lang="ts" setup>
import {RouterLink} from 'vue-router'
import IconBack from '@/assets/icons/default/IconBack.svg?component'

interface Props extends /* @vue-ignore */ LinkProps {
  text?: string
}

defineProps<Props>()

</script>
