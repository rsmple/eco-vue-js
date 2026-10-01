---
group: Guide
order: 4
description: Fetch data for the kit's lists and selects — ApiClientInstance for requests and auth, createRestModelApi for a model's queries and actions that keep every cached copy in sync, list filters kept in the URL, and handleApiError for failed requests.
---

# Data layer

Lists, infinite lists and async selects don't fetch anything themselves. They take a query hook — `useQueryFn` — and call it for each page or lookup. The kit's data utilities build those hooks on top of `@tanstack/vue-query`:

- `ApiClientInstance` sends the requests and handles auth.
- `createRestModelApi` declares a model's queries and the actions that change it, keeping every cached copy of an item in sync.
- `createUseQueryParams` keeps the filters a user sets on a list in the URL.
- `handleApiError` reports a failed request in a notification and in the form that sent it.

The [query client](/guide/getting-started#query-client) has to be installed first.

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

- `params` — the query string. Arrays of ids or strings are joined with commas, objects are sent as JSON, and empty values are left out.
- `signal` — pass the one vue-query gives the query function, so a query that is no longer needed cancels its request.
- `noAuth` — sends the request without an auth check, e.g. for the login.

URLs start and end with a slash — `/products/` or `` `/products/${ id }/` `` — and are typed that way. `addInstance(baseUrl)` gives a client for another prefix that shares the auth.

A failed request rejects with an `ApiError`, whose `response` has the `status` and the error body in `data`. A cancelled one rejects with `ApiErrorCancel`, which error handlers skip.

### Auth

The client supports two kinds of auth:

- **Cookie session** (the default). The server sets an `exp` cookie, readable from JS, with the session's expiry in seconds. Before each request the client checks it. Once it has passed, the client calls `refreshUrl` — or your own `tokenRefresh` — and then sends the request. A 401 also refreshes and retries once. Open tabs share the refresh, so only one of them calls the server. Without an `exp` cookie the client counts as logged out and rejects every request not sent with `noAuth`.
- **Bearer token.** With `tokenGetter`, the client adds `Authorization: Bearer <token>` to each request and counts as logged out when it returns nothing.

`useAuth()` returns a ref of the logged-in state, for a guard that shows the login page. `logout()` clears the session. `onFailure`, or `setOnFailure` later, is called with every failed response, e.g. to redirect on 403.

## Models

`createRestModelApi` declares every query of one model — an item, a paginated list, a list of options, a settings object — together with the actions that change it:

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

- `modelKey` names the model in the cache. Every query of the model is keyed under it, so all of them can be updated or invalidated together.
- `model` is the shape that every query of the model shares, and must have an `id`. It is used only for its type, so pass `{} as Product`.

Each query has:

- `scope` — what the query holds: `item` (one item), `list` (an array of items), `paginated` (a page, in `PaginatedResponse`), or `single` (anything else, such as settings). The first three hold items with an `id`, and actions keep them in sync. A `single` query is left alone.
- `isQueryParams` — a type guard for the query's params. Without it the query takes no params. The query only runs when its params pass the guard, so `isId` holds back an item query until there is an id. A guard that accepts `undefined` also takes `{}`, and both share one cache entry.
- `queryFn` — fetches the data. Its params are at `queryKey[2]`.
- `dataType` — the type of the query's data, again as `{} as Type`. Declare it whenever `queryFn` reads `queryKey`, and whenever a query returns a richer shape than `model`, such as the full item where the list returns a short one.
- `options` — default vue-query options for the query, e.g. `placeholderData`.

The query's name is the last part of its key. Several queries of one scope, such as two paginated endpoints with different filters, don't collide.

### Using the queries

Every query gives a hook at `<name>.use`:

```ts
const queryProduct = productModelApi.item.use(computed(() => props.productId ?? 0))
```

- `use(params, options?)` — runs the query and returns the vue-query result, with `setItem` and `removeItem` added. `params` can be a ref, and a change runs the query for the new params.
- `use.config(params)` — the query's options, for `queryClient.ensureQueryData` or `prefetchQuery` outside of a component.
- `use.setItem(item)` and `use.removeItem(id)` — write to the cache without a component.

The `use` of a `paginated` query is what [WList](/components/list), [WInfiniteList](/components/infinite-list) and the async [selects](/components/select) take as `useQueryFn`. When a row changes, the list's `setter` calls `setItem`, which updates the item in every cached query of the model.

### Actions

Actions are the requests that change the model, declared on the query they belong to:

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

They are called as `<name>.actions.<action>(params, payload)`, where `params` is left out for a query without them:

```ts
await productModelApi.item.actions.update(product.id, {name})
```

An action gets its query's params, its payload, and a context to change the cache with:

- `set(item)` — puts the item, or an array of items, in every cached query of the model that holds it — items, lists and pages alike. On an `item` query it also sets that query's data.
- `update(item => newItem)` — changes the cached items the action is about. On an `item` query that is the item with the id in the params. On a `list` or `paginated` query it is the items its bulk params select: `id__in`, or `id__not_in` and `slice_indexes` against the loaded pages with the same filters. Return `null` to remove an item. Call it before the request for an optimistic update: when the action rejects, the model's cache is restored.
- `invalidate(scope?)` — refetches the model's queries of that scope, or all of them, once the action succeeds.

An action can also return an updater instead of calling `update`, and it then resolves with nothing. `() => null` above drops the deleted product from every list. For another model, use its `invalidate(scope?)`, e.g. to refresh a dashboard after a product is added.

In the demo, the toggle's action changes the task at once, in both the list and the detail. Turn on failing requests to see the change rolled back.

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

The model behind it, with a stand-in for the server:

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
  {id: 1, title: 'Rotate the API keys', done: false},
  {id: 2, title: 'Review the new scanner rules', done: true},
  {id: 3, title: 'Update the base images', done: false},
  {id: 4, title: 'Close the stale findings', done: false},
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

The filters a user sets on a list — a search, a type, a sort order — can be kept in the URL, so a reload or a shared link opens the list as it was. `createUseQueryParams` declares them with a parser for each, which turns the value from the URL back into its type:

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

Leave `page` and `size` out: the list adds them to each page's query itself.

On a page, the declaration reads the filters from the route and writes changes back to it:

```ts
const route = useRoute()
const {queryParams, updateQueryParams} = useQueryParamsProducts(route)
```

- `queryParams` is a reactive object parsed from the route's query. It goes to the list as `query-params`. The object is created once per declaration, so the pages that use one declaration share it.
- `updateQueryParams(value)` merges `value` into the URL with `router.replace`. An empty value removes its param. Bind it to the filters and to the list's `update:query-params`, which sets `ordering` when a column is sorted.
- `useQueryParamsProducts.useQueryParamsLocal(initial?)` gives the same pair without the URL, for filters that don't need to survive a reload, e.g. in a modal.

The parsers in `eco-vue-js/dist/utils/utils` are `parseString`, `parseBoolean`, `parseInteger`, `parseId`, `parseIdList`, `parseIntegerList`, `parseStringList` and `parseJson(guard)`. A declaration's `config` can be spread into another, to share filters between lists.

## Errors

`handleApiError` shows an error notification with the server's `detail` or `non_field_errors`. With a [form](/components/form), it also shows the error body's field errors under the fields they name. It skips cancelled requests and rejects again, so a caller can still react:

```ts
const submit = () => productModelApi.item.actions.update(id, payload)
  .then(() => emit('close:modal'))
  .catch(error => handleApiError(error, formRef.value))
```

The field errors are expected in the Django REST framework shape: `{name: ['This field is required.']}`.

## Lower-level helpers

- `createDefaultQuery(modelKey, scope, name, queryFn, isQueryParams?, options?)` from `eco-vue-js/dist/utils/useDefaultQuery` builds one query hook, the way `createRestModelApi` builds each of its queries.
- `makeQueryPaginated(modelKey, getter, setter?, pageLength?)` serves a paginated query from an array in memory, and `wrapUseQueryPaginated` pages the result of a query that returns the whole list. `paginateList` pages an array into a `PaginatedResponse`.
- `setQueryItem`, `setQueryItems`, `removeQueryItem`, `removeQueryItems` and `updateQueryItems` from `eco-vue-js/dist/utils/queryCache` change a model's cached items outside an action, e.g. on a message from a websocket. `snapshotQueries` saves the model's cache and returns a function that restores it.
