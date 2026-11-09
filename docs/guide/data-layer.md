---
group: Guide
order: 4
description: Fetch data for the kit's lists and selects — ApiClientInstance for requests and auth, createRestModelApi for a model's queries and actions that keep every cached copy in sync, list filters kept in the URL, and handleApiError for failed requests.
---

# Data layer

Lists, infinite lists and async selects don't fetch on their own — they take a query hook, `useQueryFn`, and call it per page or lookup. The kit builds those hooks on `@tanstack/vue-query`:

- `ApiClientInstance` sends the requests and handles auth.
- `createRestModelApi` declares a model's queries and actions, keeping every cached copy of an item in sync.
- `createUseQueryParams` keeps list filters in the URL.
- `handleApiError` reports a failed request in a notification and in the form that sent it.

Install the [query client](/guide/getting-started#query-client) first.

## API client

One client per backend, in its own module:

```ts
import {ApiClientInstance} from 'eco-vue-js/dist/utils/ApiClient'

export const apiClient = new ApiClientInstance({
  baseUrl: '/api/v1',
  refreshUrl: '/jwt/update/',
  credentials: import.meta.env.DEV ? 'include' : 'same-origin',
})
```

`get`, `post`, `patch` and `delete` resolve with `{data, status}` and take a config with:

- `params` — query string. Arrays are comma-joined, objects sent as JSON, empty values dropped.
- `signal` — pass vue-query's, so an unneeded query cancels its request.
- `noAuth` — skips the auth check, e.g. for login.

URLs start and end with a slash (`/products/`, `` `/products/${ id }/` ``) and are typed that way. `addInstance(baseUrl)` gives a client for another prefix with shared auth.

Failures reject with `ApiError` (`response.status`, body in `response.data`). Cancelled requests reject with `ApiErrorCancel`, which error handlers skip. An unreachable server, or a gateway 502/503/504, rejects with `ApiErrorUnavailable`, a subclass of `ApiError` (no `status` on network failure).

`useAvailable()` returns a ref that turns false on such a failure and true on the next answer. Pass it to `watchServerRecovery` with a cheap probe request to refetch what failed during an outage — vue-query's `refetchOnReconnect` only tracks the browser's connection:

```ts
import {watchServerRecovery} from 'eco-vue-js/dist/utils/queryClient'

watchServerRecovery(queryClient, apiClient.useAvailable(), () => apiClient.get('/profile/'))
```

While the server is down, the probe runs every few seconds, and immediately when the browser goes online or the tab is shown. Once it answers, failed on-screen queries refetch; their error states (a list's Retry, a [page error](/components/page-error), a [query status](/components/query-status)) stay until then. If the probe succeeds immediately, only some endpoints are failing, so their queries wait for Retry instead of looping.

### Auth

Two kinds:

- **Cookie session** (default). The server sets a JS-readable `exp` cookie with the expiry in seconds. When it has passed, the client calls `refreshUrl` (or your `tokenRefresh`) before the request. A 401 also refreshes and retries once, except with `noAuth`. A refresh failing with `ApiErrorUnavailable` keeps the session; any other failure logs out. Tabs share one refresh. Without `exp` the client is logged out and rejects everything but `noAuth` requests.
- **Bearer token.** With `tokenGetter`, the client sends `Authorization: Bearer <token>` and is logged out when it returns nothing.

`useAuth()` returns a logged-in ref for a login guard. `logout()` clears the session. `onFailure` (or `setOnFailure`) receives every failed response, e.g. to redirect on 403.

## Models

`createRestModelApi` declares every query of one model — item, paginated list, options list, settings — with the actions that change it:

```ts
import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {isId} from 'eco-vue-js/dist/utils/utils'

import {apiClient} from '@/api/ApiClient'

const PRODUCT_PATH = '/products/'

export const productModelApi = createRestModelApi({
  modelKey: 'Product',
  model: {} as Product,
  queries: {
    item: {
      scope: 'item',
      dataType: {} as Product,
      isQueryParams: isId,
      queryFn: ({queryKey, signal}) => apiClient
        .get<Product>(`${ PRODUCT_PATH }${ queryKey[2] }/`, {signal})
        .then(response => response.data),
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Product>,
      isQueryParams: (value: unknown): value is QueryParamsProducts | undefined => value === undefined || value instanceof Object,
      queryFn: ({queryKey, signal}) => apiClient
        .get<PaginatedResponse<Product>>(PRODUCT_PATH, {signal, params: queryKey[2]})
        .then(response => response.data),
    },
  },
})
```

- `modelKey` — the model's cache key; all its queries sit under it, so they update or invalidate together.
- `model` — the shape all queries share; must have an `id`. Type only: `{} as Product`.

Each query has:

- `scope` — `item`, `list` (array), `paginated` (`PaginatedResponse`) or `single` (anything else, like settings). The first three hold items with an `id` and are kept in sync by actions; `single` is left alone.
- `isQueryParams` — type guard for params; without it the query takes none. The query runs only when params pass, so `isId` holds an item query until there is an id. A guard accepting `undefined` also takes `{}`, sharing one cache entry.
- `queryFn` — fetches the data; params are at `queryKey[2]`.
- `dataType` — the data type as `{} as Type`. Declare it when `queryFn` reads `queryKey`, or when the query returns a richer shape than `model`.
- `options` — default vue-query options, e.g. `placeholderData`.

The query's name is the last key segment, so several queries of one scope don't collide.

### Using the queries

Each query gives a hook at `<name>.use`:

```ts
const queryProduct = productModelApi.item.use(computed(() => props.productId ?? 0))
```

- `use(params, options?)` — runs the query; returns the vue-query result plus `setItem` and `removeItem`. `params` can be a ref.
- `use.config(params)` — the query options, for `ensureQueryData` or `prefetchQuery` outside components.
- `use.setItem(item)`, `use.removeItem(id)` — write to the cache without a component.

A `paginated` query's `use` is what [WList](/components/list), [WInfiniteList](/components/infinite-list) and async [selects](/components/select) take as `useQueryFn`. When a row changes, the list's `setter` calls `setItem`, updating it in every cached query of the model.

### Actions

Actions are the requests that change the model, declared on their query:

```ts
item: {
  scope: 'item',
  // …
  actions: {
    update: ({set, invalidate}, id, payload: Partial<Product>) => apiClient
      .patch<Product>(`${ PRODUCT_PATH }${ id }/`, payload)
      .then(response => {
        set(response.data)
        invalidate('paginated')

        return response.data
      }),

    delete: (context, id) => apiClient
      .delete(`${ PRODUCT_PATH }${ id }/`)
      .then(() => () => null),
  },
},
```

Call them as `<name>.actions.<action>(params, payload)`; omit `params` for a query without them:

```ts
await productModelApi.item.actions.update(product.id, {name})
```

An action receives its query's params, the payload and a cache context:

- `set(item)` — writes the item (or array) into every cached query of the model that holds it. On an `item` query it also sets that query's data.
- `update(item => newItem)` — changes the items the action targets: on `item`, the one with the params' id; on `list`/`paginated`, those selected by `id__in`, or `id__not_in` and `slice_indexes` against loaded pages with the same filters. Return `null` to remove. Call it before the request for an optimistic update — the cache is restored if the action rejects.
- `invalidate(scope?)` — refetches that scope (or all) once the action succeeds.

An action can instead return an updater, and then resolves with nothing — `() => null` above drops the deleted product from every list. For another model, call its `invalidate(scope?)`.

In the demo, toggling updates the list and the detail at once. Turn on failing requests to see the rollback.

<!-- @example guide/data-layer/TaskDemo client -->

<DocsDemo name="guide/data-layer/TaskDemo" client-only />

```vue
<template>
  <div class="grid gap-6">
    <div class="grid gap-6 md:grid-cols-2">
      <div class="grid content-start gap-1">
        <span class="text-description text-sm">taskModelApi.paginated</span>

        <button
          v-for="task in queryTasks.data.value?.results"
          :key="task.id"
          class="flex items-center gap-2 rounded-lg px-2 py-1 text-left [&_svg]:square-4"
          :class="{'bg-surface-muted': task.id === selected}"
          @click="selected = task.id"
        >
          <WStatusIcon :has-value="task.done" />
          {{ task.title }}
        </button>

        <WSkeleton
          v-for="index in queryTasks.data.value ? 0 : 4"
          :key="index"
        />
      </div>

      <div class="grid content-start gap-3">
        <span class="text-description text-sm">taskModelApi.item</span>

        <span class="font-semibold">
          <WSkeleton v-if="!queryTask.data.value" />

          <template v-else>
            {{ queryTask.data.value.title }}
          </template>
        </span>

        <WToggle
          :model-value="queryTask.data.value?.done ?? false"
          title="Done"
          :skeleton="!queryTask.data.value"
          @update:model-value="toggle"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <WToggle
        v-model="server.fail"
        title="Requests fail"
      />

      <span
        v-if="error"
        class="tone-negative text-tone text-sm"
      >
        {{ error }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'
import WStatusIcon from 'eco-vue-js/dist/components/Status/WStatusIcon.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'

import {server, taskModelApi} from './api/Task'

const selected = ref(1)
const error = ref<string>()

const queryTasks = taskModelApi.paginated.use({})
const queryTask = taskModelApi.item.use(selected)

const toggle = (done: boolean) => {
  error.value = undefined

  taskModelApi.item.actions.update(selected.value, {done})
    .catch(() => error.value = 'The update failed and was rolled back.')
}
</script>
```

<!-- @example-end -->

The model, with a stand-in server:

<!-- @source docs/examples/guide/data-layer/api/Task.ts -->

```ts [Task.ts]
import {reactive} from 'vue'

import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'
import {isId} from 'eco-vue-js/dist/utils/utils'

export type Task = {
  id: number
  title: string
  done: boolean
}

export type QueryParamsTasks = {
  page?: number
}

let tasks: Task[] = [
  {id: 1, title: 'Repot the monstera', done: false},
  {id: 2, title: 'Prune the roses', done: true},
  {id: 3, title: 'Sow the tomato seeds', done: false},
  {id: 4, title: 'Clean the greenhouse gutters', done: false},
]

/** Lets the demo make every request fail, to show the rollback. */
export const server = reactive({fail: false})

/** Stands in for a request to the API: answers after half a second, or fails. */
const respond = <Data>(handler: () => Data) => new Promise<Data>((resolve, reject) => {
  setTimeout(() => {
    if (server.fail) reject(new Error('Server error'))
    else resolve(structuredClone(handler()))
  }, 500)
})

export const taskModelApi = createRestModelApi({
  modelKey: 'Task',
  model: {} as Task,
  queries: {
    item: {
      scope: 'item',
      dataType: {} as Task,
      isQueryParams: isId,
      queryFn: ({queryKey}) => respond(() => tasks.find(task => task.id === queryKey[2])!),
      actions: {
        update: ({update, set}, id, payload: Partial<Task>) => {
          // Shows the change at once, in every cached query holding the task. Rolled back if the request fails.
          update(task => ({...task, ...payload}))

          return respond(() => {
            tasks = tasks.map(task => task.id === id ? {...task, ...payload} : task)

            return tasks.find(task => task.id === id)!
          })
            .then(task => set(task))
        },
      },
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Task>,
      isQueryParams: (value: unknown): value is QueryParamsTasks | undefined => value === undefined || value instanceof Object,
      queryFn: ({queryKey}) => respond(() => paginateList(tasks, queryKey[2]?.page)),
    },
  },
})
```

<!-- @source-end -->

## Filters in the URL

Filters kept in the URL survive reloads and shared links. `createUseQueryParams` declares them with a parser each:

```ts
import {createUseQueryParams} from 'eco-vue-js/dist/utils/api'
import {parseBoolean, parseIdList, parseString} from 'eco-vue-js/dist/utils/utils'

export const useQueryParamsProducts = createUseQueryParams({
  search: parseString,
  product_type__in: parseIdList,
  is_default: parseBoolean,
  ordering: parseString,
})

export type QueryParamsProducts = typeof useQueryParamsProducts['QueryParams']
```

Leave `page` and `size` out — the list adds them.

On a page, it reads from and writes to the route:

```ts
const route = useRoute()
const {queryParams, updateQueryParams} = useQueryParamsProducts(route)
```

- `queryParams` — reactive object parsed from the route query; pass it as `query-params`. Created once per declaration, so pages using it share it.
- `updateQueryParams(value)` — merges into the URL via `router.replace`; empty values remove the param. Bind it to the filters and to the list's `update:query-params` (sets `ordering` on sort).
- `useQueryParamsProducts.useQueryParamsLocal(initial?)` — the same pair without the URL, e.g. in a modal.

Parsers in `eco-vue-js/dist/utils/utils`: `parseString`, `parseBoolean`, `parseInteger`, `parseId`, `parseIdList`, `parseIntegerList`, `parseStringList`, `parseJson(guard)`. Spread a declaration's `config` into another to share filters.

## Errors

`handleApiError` shows a notification with the server's `detail` or `non_field_errors` and, in a [form](/components/form), field errors under their fields. It skips cancelled requests and rethrows:

```ts
const submit = () => productModelApi.item.actions.update(id, payload)
  .then(() => emit('close:modal'))
  .catch(error => handleApiError(error, formRef.value))
```

Field errors use the Django REST framework shape: `{name: ['This field is required.']}`.

## Lower-level helpers

- `createDefaultQuery(modelKey, scope, name, queryFn, isQueryParams?, options?)` from `eco-vue-js/dist/utils/useDefaultQuery` builds one query hook.
- `makeQueryPaginated(modelKey, getter, setter?, pageLength?)` serves a paginated query from memory; `wrapUseQueryPaginated` pages a whole-list query; `paginateList` pages an array into a `PaginatedResponse`.
- `setQueryItem`, `setQueryItems`, `removeQueryItem`, `removeQueryItems`, `updateQueryItems` (`eco-vue-js/dist/utils/queryCache`) change cached items outside actions, e.g. from a websocket. `snapshotQueries` saves the cache and returns a restore function.
