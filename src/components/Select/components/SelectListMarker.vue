<template>
  <div
    ref="indicator"
    class="h-20 flex items-center justify-center"
  >
    <WSpinner v-if="loading" />
  </div>
</template>

<script lang="ts" setup>
import {watch} from 'vue'
import WSpinner from '@/components/Spinner/WSpinner.vue'
import {useSelectListMarker} from '../use/useSelectListMarker'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:intersecting', value: boolean): void
}>()

const {indicator, isIntersecting} = useSelectListMarker()

watch(isIntersecting, value => emit('update:intersecting', value))

</script>