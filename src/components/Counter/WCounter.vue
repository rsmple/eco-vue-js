<template>
  <div
    class="flex min-w-[1.25em] items-center justify-center rounded-full px-[0.375em] font-medium leading-tight"
    :class="[{
      'animate-shake': isShake,
    }, semanticTypeBgMap[semanticType]]"
  >
    {{ numberCompactFormatter.format(count) }}
  </div>
</template>

<script setup lang="ts">
import {ref, toRef, watch} from 'vue'

import {SemanticType, useSemanticTypeChipMap} from '@/utils/SemanticType'
import {numberCompactFormatter} from '@/utils/utils'

const props = withDefaults(
  defineProps<{
    count: number
    trigger?: number
    small?: boolean
    semanticType?: SemanticType
  }>(),
  {
    trigger: 2,
    semanticType: SemanticType.NEGATIVE,
  },
)

const semanticTypeBgMap = useSemanticTypeChipMap()

const isShake = ref(false)

let timeout: ReturnType<typeof setTimeout> | null = null

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
