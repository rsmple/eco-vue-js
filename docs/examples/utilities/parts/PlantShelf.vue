<template>
  <div class="flex flex-wrap gap-2">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {toRef} from 'vue'

import {useProvideReadonly, useProvideSkeleton} from 'eco-vue-js/dist/utils/provide'

const props = defineProps<{
  readonly: boolean
  skeleton: boolean
}>()

// Everything inside the shelf inherits the two states, the kit's controls included.
useProvideReadonly(toRef(props, 'readonly'))
useProvideSkeleton(toRef(props, 'skeleton'))
</script>
