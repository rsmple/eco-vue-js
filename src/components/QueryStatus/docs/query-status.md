---
group: Feedback
description: WQueryStatus — one message for the whole app when queries on screen fail to load, with Retry, and frozen skeletons while the server is down.
---

# Query status

`WQueryStatus` watches every query on screen. When one fails without data and asking again may help — the server could not be reached, or answered 5xx, 408 or 429 — a single message shows under the header with a Retry button that fetches every failed query again. Mount it once, next to the other [global containers](/guide/getting-started#global-containers):

```vue
<template>
  <RouterView />

  <WQueryStatus />
  <WNotify />
</template>

<script lang="ts" setup>
import WNotify from 'eco-vue-js/dist/components/Notify/WNotify.vue'
import WQueryStatus from 'eco-vue-js/dist/components/QueryStatus/WQueryStatus.vue'
</script>
```

While the server cannot be reached, every skeleton on the page stops and greys out, since none of them will load. Once [`watchServerRecovery`](/guide/data-layer) sees the server again, the failed queries are fetched again and the message goes away on its own.

A failure a component already shows stays out of the message: a list page with its error and Retry, or a [page error](/components/page-error). A [query boundary](/components/query-boundary) around a card greys out only that card's skeletons, and leaves the message to `WQueryStatus`. Errors that will not pass by asking again, such as 403 and 404, are never shown here.

The texts are `serverUnavailable`, `partialLoadError` and `retry` — see [Texts](/guide/getting-started#texts).

## API

<!-- @api WQueryStatus -->

### WQueryStatus

```ts
import WQueryStatus from 'eco-vue-js/dist/components/QueryStatus/WQueryStatus.vue'
```

#### Props

_No props._

<!-- @api-end -->
