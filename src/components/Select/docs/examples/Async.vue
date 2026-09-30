<template>
  <WSelectAsyncSingle
    v-model="bookId"
    :use-query-fn-options="bookModelApi.paginated.use"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Book"
    placeholder="Search by title or author"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  >
    <template #option="{option}">
      <span v-if="option">
        {{ option.title }} <span class="text-description">— {{ option.author }}</span>
      </span>
    </template>
  </WSelectAsyncSingle>

  <p class="text-sm text-gray-500">
    Model: {{ bookId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'

// The `use` of any paginated query — here the book model from the list recipe.
import {bookModelApi} from '../../../../../docs/examples/recipes/book-list/api/Book'

const bookId = ref<number | null>(3)
</script>
