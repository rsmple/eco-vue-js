<template>
  <div
    class="bg-negative dark:bg-negative-dark text-default flex items-center justify-center px-1 text-xs font-medium"
    :class="{
      'animate-shake': isShake,
      'h-4 min-w-4 rounded-lg': small,
      'h-5 min-w-5 rounded-[0.625rem]': !small,
    }"
  >
    {{ numberCompactFormatter.format(count) }}
  </div>
</template>

<script setup lang="ts">
import {ref, toRef, watch} from 'vue'

import {numberCompactFormatter} from '@/utils/utils'

const props = withDefaults(
  defineProps<{
    count: number
    trigger?: number
    small?: boolean
  }>(),
  {
    trigger: 2,
  },
)

const isShake = ref(false)

let timeout: NodeJS.Timeout | null = null

watch(toRef(props, 'count'), value => {
  if (value >= props.trigger) {
    isShake.value = true

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      isShake.value = false

      timeout = null
    }, 600)
  }
})
</script>
