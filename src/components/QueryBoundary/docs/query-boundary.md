---
group: Display
description: WQueryBoundary — stops the skeletons of a card whose query failed and shows why, with Retry when asking again may help.
---

# Query boundary

A card shows skeletons while its queries load; if one fails, they'd shimmer forever. `WQueryBoundary` wraps the card and takes its queries: once one fails without data, the skeletons stop and grey out under a short message, keeping the card's size and layout.

The message is the server's `detail`, or the `serverUnavailable` or `loadError` [text](/guide/getting-started#texts). For an unreachable server or a 5xx, Retry refetches the failed queries with shimmering skeletons. Permanent failures (e.g. 403) show only the message.

A query with data keeps showing it if a later refetch fails.

With a [`WQueryStatus`](/components/query-status) in the app, retryable failures are reported once for the page; the card only greys out its skeletons. Permanent failures still show on the card.

<!-- @example QueryBoundary/Basic -->

<DocsDemo name="QueryBoundary/Basic" />

```vue
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
```

<!-- @example-end -->

## API

<!-- @api WQueryBoundary -->

### WQueryBoundary

```ts
import WQueryBoundary from 'eco-vue-js/dist/components/QueryBoundary/WQueryBoundary.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `queries` | `BoundaryQuery[]` | **required** | The queries the content shows, such as `[queryStats, queryItems]`. When one of them failed without data, its skeletons stop and grey out under a message, with Retry when asking again may help. With a `WQueryStatus` in the app, a failure asking again may fix is told there instead, and the content only greys out. |
| `tag` | `keyof HTMLElementTagNameMap` | — | Element that wraps the content. Inside a card that is a link or has its own layout, `class="contents"` keeps the card's layout, and the message centers on the nearest positioned ancestor. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | The content, with its own skeletons while the queries load. |

<!-- @api-end -->
