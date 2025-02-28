<template>
  <div
    class="bg-negative dark:bg-negative-dark text-default flex min-w-[1.25em] items-center justify-center rounded-full px-[0.375em] font-medium leading-tight"
    :class="{
      'animate-shake': isShake,
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
