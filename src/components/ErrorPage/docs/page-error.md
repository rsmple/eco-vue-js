---
group: Display
description: WPageError — replaces a page whose query failed with the status, the server's message, Back and, when asking again may help, Retry.
---

# Page error

`WPageError` wraps a page that shows one item. While the query's `error` is set, the page is replaced with the status and the server's `detail`, and a Back button. When the server could not be reached or failed with a 5xx, it also offers Retry, which fetches again every failed query on screen.

Without a `detail` from the server, the message comes from the [texts](/utilities/helpers): `serverUnavailable`, `serverError` or `pageNotFound`. Set them with `setTexts` to translate them, along with `errorTitle`, `back` and `retry`.

<!-- @example ErrorPage/Basic -->

<DocsDemo name="ErrorPage/Basic" />

```vue
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
```

<!-- @example-end -->

## API

<!-- @api WPageError -->

### WPageError

```ts
import WPageError from 'eco-vue-js/dist/components/ErrorPage/WPageError.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `error` | `Error \| null` | **required** | The error of the query the page shows, such as `query.error.value`. While it is set, the page is replaced with the error, its status and the server's `detail`; a failure that may pass also gets a Retry button. |
| `tag` | `keyof HTMLElementTagNameMap` | — | Element that wraps the page when there is no error. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | The page, shown while there is no error. |

<!-- @api-end -->
