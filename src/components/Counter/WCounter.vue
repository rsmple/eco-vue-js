<template>
  <div
    class="px-1 bg-negative dark:bg-negative-dark text-default text-xs font-medium flex items-center justify-center"
    :class="{
      'animate-shake': isShake,
      'h-4 min-w-[1rem] rounded-lg': small,
      'h-5 min-w-[1.25rem] rounded-[0.625rem]': !small,
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
