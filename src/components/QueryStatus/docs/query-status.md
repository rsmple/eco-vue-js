---
group: Display
description: WQueryStatus — one message for the whole app when queries on screen fail to load, with Retry, and frozen skeletons while the server is down.
---

# Query status

`WQueryStatus` watches every on-screen query. When one fails without data and a retry may help (unreachable server, 5xx, 408 or 429), one message shows under the header with Retry, which refetches all failed queries. Mount it once with the other [global containers](/guide/getting-started#global-containers):

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

While the server is unreachable, every skeleton stops and greys out. Once [`watchServerRecovery`](/guide/data-layer) sees it again, failed queries refetch and the message clears.

Failures a component already shows are left out: a list page's error and Retry, or a [page error](/components/page-error). A [query boundary](/components/query-boundary) only greys out its card and leaves the message to `WQueryStatus`. Permanent errors like 403 and 404 never show here.

Texts: `serverUnavailable`, `partialLoadError`, `retry` — see [Texts](/guide/getting-started#texts).

## API

<!-- @api WQueryStatus -->

### WQueryStatus

```ts
import WQueryStatus from 'eco-vue-js/dist/components/QueryStatus/WQueryStatus.vue'
```

#### Props

_No props._

<!-- @api-end -->
