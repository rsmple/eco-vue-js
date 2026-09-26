<template>
  <div class="py-4">
    <WSkeleton v-if="skeleton || !item" />

    <p
      v-else
      class="text-description"
    >
      {{ item.description }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type {Book, QueryParamsBooks} from './models/Book'

import type {FieldProps} from 'eco-vue-js/dist/components/List/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<Omit<FieldProps<Book | undefined, QueryParamsBooks>, 'config'>>()
</script>
