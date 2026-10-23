<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <WButton
        v-for="(item, key) in errors"
        :key="key"
        :semantic-type="SemanticType.SECONDARY"
        @click="error = item"
      >
        {{ key }}
      </WButton>
    </div>

    <WPageError :error="error">
      <div class="text-description py-24 text-center">
        The greenhouse page
      </div>
    </WPageError>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {ApiError, ApiErrorUnavailable} from 'eco-vue-js/dist/utils/api'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WPageError from 'eco-vue-js/dist/components/ErrorPage/WPageError.vue'

const request = new Request('https://example.com/api/greenhouses/7/')

const errors: Record<string, Error | null> = {
  Loaded: null,
  'Not found': new ApiError({data: {detail: 'No greenhouse matches the given query.'}, status: 404, request}),
  'Server down': new ApiErrorUnavailable({data: undefined, request}),
  'Server error': new ApiError({data: {}, status: 500, request}),
}

const error = ref<Error | null>(null)
</script>
