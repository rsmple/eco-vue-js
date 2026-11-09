---
group: Data
description: WInfiniteList — items of a paginated query loaded page by page as you scroll, with a sticky header, skeletons while loading and scrolling inside any element.
---

# Infinite list

`WInfiniteList` loads a paginated query page by page on scroll and renders each item with its default slot. It has no layout of its own — [WList](/components/list) and async selects build on it. You provide:

- `useQueryFn` and `queryParams` — a paginated query; each page is its own query with `page` and `size` added.
- `pageLength` — the query's page size.
- A default slot per item; loading pages render it with `skeleton`.

Changing `queryParams` (e.g. a new search) resets to page one. Only `maxPages` pages stay rendered; dropped pages keep their height so the scrollbar stays accurate.

<!-- @example InfiniteList/Basic -->

<DocsDemo name="InfiniteList/Basic" />

```vue
<template>
  <WInfiniteListScrollingElement class="h-96 overflow-y-auto overscroll-contain rounded-xl border border-solid border-line-subtle">
    <WInfiniteList
      :use-query-fn="plantModelApi.paginated.use"
      :query-params="{search}"
      :page-length="10"
      page-class="grid"
      empty-stub="No plants found"
      min-height-only
      @update:count="count = $event"
    >
      <template #header>
        <div class="flex items-center gap-4 px-4 pb-3">
          <WInput
            v-model="search"
            placeholder="Search by name or species"
            class="flex-1"
            no-margin
          />

          <span class="text-description text-sm whitespace-nowrap">
            {{ count }} plants
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
            {{ item.name }} <span class="text-description italic">— {{ item.species }}</span>
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

// The `use` of any paginated query — here the plant model from the list recipe, 10 plants a page.
import {plantModelApi} from '../../../../../docs/examples/recipes/plant-list/api/Plant'

const search = ref<string>()
const count = ref(0)
</script>
```

<!-- @example-end -->

## Scrolling inside an element

By default the list follows page scroll. `WInfiniteListScrollingElement` makes an element the scroll container for lists and sticky headers inside — give it a height and `overflow-y-auto`. Modals already are scroll containers.

## Sticky header

The `header` slot sticks above the items: under the app header on a page, at the top in a modal or scroll container. It gets `refetchAll`, `isFetching` and `isRefetchingAll` for a refresh toolbar. `updateHeader` re-measures it immediately.

`WInfiniteListWrapper` is the same sticky header for any content:

```vue
<WInfiniteListWrapper>
  <template #header>
    <PageToolbar />
  </template>

  <ReportSections />
</WInfiniteListWrapper>
```

## Items

Besides `item` and `skeleton`, the slot gets:

- `setter` — writes a changed item to the cache, updating every loaded page and query of the model; with no argument, removes it.
- `refetch` — refetches this page and those after it, e.g. after a move.
- `previous`, `next` — neighbouring items across pages; `first`, `last` — the list ends.
- `position` — index in the whole list; `page`, `index` — page and index within it.

## Pages

A template ref gives `refetchAll`, `resetPage(page)` and `goto(page, index)`. An unrendered target page renders in place with its neighbours; before the page count is known, the list restarts from that page.

`update:page` reports the scrolled-to page. Keep it in the URL and pass it back as `page` in `queryParams` to reopen there after a reload; earlier pages load on scroll up.

## Long lists

Only `maxPages` pages stay in the DOM. Scrolled-past pages leave a same-height space and stay cached, so scrolling back is instant. Spacers above and below are sized by page count × average rendered height, so the scrollbar spans the whole list from the start. Browsers cap element height, so past ~15M px (about a million rows) the spacers shrink and the scrollbar moves faster than the rows.

The demo pages through 10,000 events, 50 at a time; the counter shows rows in the DOM. "Go to row" calls `goto` and loads the surrounding pages in place.

<!-- @example InfiniteList/Large -->

<DocsDemo name="InfiniteList/Large" />

```vue
<template>
  <div
    ref="container"
    class="grid gap-3"
  >
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
      <form
        class="flex items-center gap-2"
        @submit.prevent="jump"
      >
        <WInput
          v-model="row"
          type="number"
          :min="1"
          :max="EVENT_COUNT"
          placeholder="Row"
          class="w-28"
          no-margin
        />

        <WButton
          :semantic-type="SemanticType.SECONDARY"
          type="submit"
        >
          Go to row
        </WButton>
      </form>

      <span class="text-description text-sm tabular-nums">
        {{ rendered }} of {{ count.toLocaleString('en') }} rows rendered
      </span>
    </div>

    <WInfiniteListScrollingElement class="h-96 overflow-y-auto overscroll-contain rounded-xl border border-solid border-line-subtle">
      <WInfiniteList
        ref="list"
        :use-query-fn="eventModelApi.paginated.use"
        :query-params="{}"
        :page-length="PAGE_LENGTH"
        page-class="grid"
        min-height-only
        @update:count="count = $event"
      >
        <template #default="{item, skeleton, position}">
          <div
            class="event-row flex h-9 items-center gap-3 border-b border-solid border-line-subtle px-4 text-sm"
          >
            <span class="text-description w-12 text-right tabular-nums">
              {{ position + 1 }}
            </span>

            <WSkeleton v-if="skeleton" />

            <template v-else>
              <span
                class="w-16 font-semibold"
                :class="levelClass[item.level]"
              >
                {{ item.level }}
              </span>

              <span class="text-description w-12 tabular-nums">
                {{ timeFormatter.format(item.at) }}
              </span>

              <span class="truncate">{{ item.message }}</span>
            </template>
          </div>
        </template>
      </WInfiniteList>
    </WInfiniteListScrollingElement>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, useTemplateRef} from 'vue'

import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WButton from 'eco-vue-js/dist/components/Button/WButton.vue'
import WInfiniteList from 'eco-vue-js/dist/components/InfiniteList/WInfiniteList.vue'
import WInfiniteListScrollingElement from 'eco-vue-js/dist/components/InfiniteList/WInfiniteListScrollingElement.vue'
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

import {EVENT_COUNT, EventLevel, eventModelApi} from './api/Event'

const PAGE_LENGTH = 50

const levelClass: Record<EventLevel, string> = {
  [EventLevel.INFO]: 'tone-info text-tone',
  [EventLevel.WARNING]: 'tone-warning text-tone',
  [EventLevel.ERROR]: 'tone-negative text-tone',
}

const timeFormatter = Intl.DateTimeFormat('en', {hour: '2-digit', minute: '2-digit', hourCycle: 'h23'})

const listRef = useTemplateRef('list')
const containerRef = useTemplateRef('container')

const count = ref(0)
const row = ref<number>()

// Scrolls to a loaded page, or starts the list over from the row's page.
const jump = () => {
  if (!row.value) return

  const index = Math.min(Math.max(row.value, 1), count.value || EVENT_COUNT) - 1

  listRef.value?.goto(Math.floor(index / PAGE_LENGTH) + 1, index % PAGE_LENGTH)
}

// Only for the demo: counts the rows in the DOM, to show that only a few pages are rendered at a time.
const rendered = ref(0)

let observer: MutationObserver | undefined

onMounted(() => {
  observer = new MutationObserver(() => {
    rendered.value = containerRef.value?.querySelectorAll('.event-row').length ?? 0
  })

  if (containerRef.value) observer.observe(containerRef.value, {childList: true, subtree: true})
})

onBeforeUnmount(() => observer?.disconnect())
</script>
```

<!-- @example-end -->

## API

<!-- @api WInfiniteList -->

### WInfiniteList

```ts
import WInfiniteList from 'eco-vue-js/dist/components/InfiniteList/WInfiniteList.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `useQueryFn` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query the pages are loaded with. Each page gets `queryParams` with its `page` and `size`. |
| `queryParams` | `QueryParams` | **required** | Params of the query. A change resets the list to the first page. A `page` starts the list at that page. |
| `skeletonLength` | `number` | — | Number of skeleton items while the first pages load, e.g. the known total count. Defaults to a full page. |
| `transition` | `boolean` | — | Animates items as they are added or removed. |
| `minHeight` | `boolean` | — | Renders without the sticky header and fills the height of its container, e.g. for a list inside a dropdown. |
| `minHeightOnly` | `boolean` | — | Drops the full-screen minimum height and the bottom padding, for a list inside other content. |
| `noHeaderUpdate` | `boolean` | — | Keeps the sticky header out of the app header bar's padding while scrolled. |
| `excludeParams` | `(keyof QueryParams)[]` | — | Params whose change refetches the loaded pages in place instead of resetting the list to the first page. |
| `emptyStub` | `string` | — | Text shown when the query returns no items. The `empty` slot replaces it. |
| `pageClass` | `string` | — | Class of the element holding the items of all loaded pages, e.g. a grid layout. The pages render no element of their own, so a grid row runs on from one page into the next. |
| `pageStyle` | `StyleValue` | — | Style of the element holding the items, e.g. the columns of a grid. |
| `maxPages` | `number` | — | Number of pages kept rendered, 5 by default. Scrolling further drops pages at the other end, keeping their height as space. |
| `keepColumns` | `boolean` | — | Keeps each item in its column of a `pageClass` grid with several columns, such as cards, when the list starts past the first page or drops a page at the top. Leave it off when every item spans the row, as the rows of a table: the columns are then not measured. |
| `refetchInterval` | `number \| false` | — | Refetches the pages in view every this many ms. |
| `queryOptions` | `DefaultQueryOptions<PaginatedResponse<Data>>` | — | Options for every page query. |
| `pageLength` | `number` | `24` | Page size, sent to the query as `size`. Must match the size the query returns. |
| `valueGetter` | `((data: Data) => Model)` | `(item as unknown as {     id: Model; }).id` | Unique value of an item, for the item's key and the `value` slot prop. Defaults to its `id`. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:page` | `(number \| undefined)` | The page reached by scrolling, for keeping it in the URL. `undefined` after a reset to the first page. |
| `update:count` | `(number)` | Total number of items, from the query's `count`. |
| `update:error` | `(ApiError<{}, ErrorResponse<{}>>)` | A page query failed. A page that answers 404 or 400 is dropped, and the list ends before it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ item: Data; setter: (newItem?: Data \| undefined) => void; skeleton: boolean; refetch: () => void; previous: Data \| undefined; next: Data \| undefined; first: boolean; last: boolean; resetting: boolean; page: number; index: number; position: number; value: Model; results: Data[] \| undefined; intersecting: boolean; }` | An item, or a skeleton placeholder while its page loads. `setter` writes a changed item to the query cache, or removes it when called with nothing; `position` is the item's index in the whole list. |
| `header` | `InfiniteListHeaderScope & Partial<InfiniteListScope>` | Sticky content above the items, such as a toolbar. Gets `refetchAll`, `resetPage`, `goto`, `isFetching` and `isRefetchingAll`, and `updateHeader` to re-measure it right away. |
| `empty` | — | Shown when the query returns no items. Replaces `emptyStub`. |
| `pages-before` | — | Rendered in the box that holds the loaded pages, before them, such as a layer that spans them. |
| `error` | `{ error: Error; retry: () => Promise<void>; isFetching: boolean; }` | Shown instead of a page that failed to load and has nothing cached. Gets the `error`, `retry` to load the page again, and `isFetching`. Replaces the message and Retry button. |

<!-- @api-end -->

<!-- @api WInfiniteListScrollingElement -->

### WInfiniteListScrollingElement

```ts
import WInfiniteListScrollingElement from 'eco-vue-js/dist/components/InfiniteList/WInfiniteListScrollingElement.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `parent` | `boolean` | — | Uses the parent element as the scroll container instead of this one. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Content with infinite lists and sticky headers that scroll inside this element instead of the page. |

<!-- @api-end -->

<!-- @api WInfiniteListWrapper -->

### WInfiniteListWrapper

```ts
import WInfiniteListWrapper from 'eco-vue-js/dist/components/InfiniteList/WInfiniteListWrapper.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `initIsIntersecting` | `boolean` | — | Whether the top of the content starts in view, before the first scroll is observed. `false` when opening at a later page. |
| `noHeaderUpdate` | `boolean` | — | Keeps the sticky header out of the app header bar's padding while scrolled. |
| `inPlace` | `boolean` | — | Renders the header in place over the content: it neither sticks nor pads the app header bar. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `header` | `InfiniteListHeaderScope` | Content that sticks to the top while the page scrolls. `updateHeader` re-measures it right away. |
| `default` | `InfiniteListHeaderScope` | The scrolling content. Gets the header's `headerHeight` and `headerTop`. |

<!-- @api-end -->
