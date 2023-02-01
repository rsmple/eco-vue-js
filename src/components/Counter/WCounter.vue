<template>
  <div
    class="h-5 w-5 rounded-full bg-negative dark:bg-negative-dark text-default text-xs font-medium flex items-center justify-center"
    :class="{'animate-shake': isShake}"
  >
    {{ count }}
  </div>
</template>

<script setup lang="ts">
import {ref, toRef, watch} from 'vue'

const props = withDefaults(
  defineProps<{
    count: number
    trigger?: number
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
