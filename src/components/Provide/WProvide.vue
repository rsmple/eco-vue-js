<template>
  <slot />
</template>

<script setup lang="ts">
import {computed, inject, provide} from 'vue'

import {wReadonly} from '@/utils/utils'

const props = defineProps<{
  readonly?: boolean
}>()

const readonlyInjected = inject(wReadonly, undefined)

const isReadonly = computed(() => props.readonly || (readonlyInjected?.value ?? false))

provide(wReadonly, isReadonly)
</script>