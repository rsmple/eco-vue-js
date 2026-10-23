<template>
  <div class="grid max-w-sm gap-4">
    <div class="flex flex-wrap gap-2">
      <WButton
        v-for="(item, key) in errors"
        :key="key"
        :semantic-type="SemanticType.SECONDARY"
        @click="fail(item)"
      >
        {{ key }}
      </WButton>
    </div>

    <WQueryBoundary
      :queries="[query]"
      class="grid gap-2 rounded-xl border border-solid border-line-subtle p-4"
    >
      <div class="font-semibold">
        Harvest this week
      </div>

      <template v-if="query.data.value">
        <div
          v-for="item in query.data.value"
          :key="item"
        >
          {{ item }}
        </div>
      </template>

      <template v-else>
        <WSkeleton
          v-for="index in 3"
          :key="index"
        />
      </template>
    </WQueryBoundary>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {ApiError, ApiErrorUnavailable} from 'eco-vue-js/dist/utils/api'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WQueryBoundary from 'eco-vue-js/dist/components/QueryBoundary/WQueryBoundary.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

const request = new Request('https://example.com/api/harvest/')

const errors: Record<string, Error> = {
  'Server down': new ApiErrorUnavailable({data: undefined, request}),
  Forbidden: new ApiError({data: {detail: 'You cannot see the harvest.'}, status: 403, request}),
}

const query = {
  data: ref<string[] | undefined>(['Tomatoes, 12 kg', 'Basil, 3 bunches', 'Zucchini, 7']),
  error: ref<Error | null>(null),
  refetch: () => {
    query.error.value = null

    return new Promise<void>(resolve => setTimeout(() => {
      query.data.value = ['Tomatoes, 12 kg', 'Basil, 3 bunches', 'Zucchini, 7']
      resolve()
    }, 1500))
  },
}

const fail = (error: Error) => {
  query.data.value = undefined
  query.error.value = error
}
</script>
