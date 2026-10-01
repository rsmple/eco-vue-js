<template>
  <WInfiniteListScrollingElement class="h-96 overflow-y-auto overscroll-contain rounded-xl border border-solid border-line-subtle">
    <WInfiniteList
      :use-query-fn="bookModelApi.paginated.use"
      :query-params="{search}"
      :page-length="10"
      page-class="grid"
      empty-stub="No books found"
      min-height-only
      @update:count="count = $event"
    >
      <template #header>
        <div class="flex items-center gap-4 px-4 pb-3">
          <WInput
            v-model="search"
            placeholder="Search by title or author"
            class="flex-1"
            no-margin
          />

          <span class="text-description text-sm whitespace-nowrap">
            {{ count }} books
          </span>
        </div>
      </template>

      <template #default="{item, skeleton, position}">
        <div class="flex items-baseline gap-3 border-t border-solid border-line-subtle px-4 py-2">
          <span class="text-description w-6 text-right text-sm">
            {{ position + 1 }}
          </span>

          <WSkeleton v-if="skeleton" />

          <span v-else>
            {{ item.title }} <span class="text-description">— {{ item.author }}</span>
          </span>
        </div>
      </template>
    </WInfiniteList>
  </WInfiniteListScrollingElement>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInfiniteList from 'eco-vue-js/dist/components/InfiniteList/WInfiniteList.vue'
import WInfiniteListScrollingElement from 'eco-vue-js/dist/components/InfiniteList/WInfiniteListScrollingElement.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

// The `use` of any paginated query — here the book model from the list recipe, 10 books a page.
import {bookModelApi} from '../../../../../docs/examples/recipes/book-list/api/Book'

const search = ref<string>()
const count = ref(0)
</script>
