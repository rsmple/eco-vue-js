<template>
  <WSkeleton
    v-if="isSkeleton"
    class="w-skeleton-w-24 w-skeleton-h-8 w-skeleton-rounded-full"
  />

  <button
    v-else
    class="tone-positive surface-fill rounded-full px-3 py-1 text-sm font-semibold"
    :class="isReadonly ? 'cursor-default' : 'cursor-pointer'"
    :disabled="isReadonly"
    @click="$emit('water')"
  >
    {{ isReadonly ? name : `Water ${ name }` }}
  </button>
</template>

<script lang="ts" setup>
import {useComponentStates} from 'eco-vue-js/dist/utils/useComponentStates'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

const props = defineProps<{
  name: string
  readonly?: boolean
  skeleton?: boolean
}>()

defineEmits<{
  (e: 'water'): void
}>()

// A prop that is set wins; unset, the state comes from the nearest parent that provides it.
const {isReadonly, isSkeleton} = useComponentStates(props)
</script>
