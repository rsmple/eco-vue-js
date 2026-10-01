---
group: Data
description: WInfiniteList — items of a paginated query loaded page by page as you scroll, with a sticky header, skeletons while loading and scrolling inside any element.
---

# Infinite list

`WInfiniteList` loads a paginated query page by page as it is scrolled, and renders each item with its default slot. It lays out nothing itself, so it fits any item layout — [WList](/components/list) and the async selects are built on it. You give it:

- `useQueryFn` and `queryParams` — a paginated query. Each page is its own query with `page` and `size` added to the params.
- `pageLength` — the page size the query returns.
- A default slot for an item. While a page loads, the slot renders placeholders with `skeleton` set.

A change of `queryParams`, such as a new search, resets the list to the first page. Only a few pages stay rendered (`maxPages`). Scrolling further drops pages at the other end and keeps their height, so the scrollbar stays true to the whole list.

<!-- @example InfiniteList/Basic -->

<DocsDemo name="InfiniteList/Basic" />

```vue
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
```

<!-- @example-end -->

## Scrolling inside an element

By default the list loads as the page scrolls. `WInfiniteListScrollingElement` makes an element the scroll container instead, for the lists and sticky headers inside it — give it a height and `overflow-y-auto`, as above. Modals are scroll containers of their own already.

## Sticky header

The `header` slot sticks above the items while they scroll: under the app header on a page, and at the top of a modal or scroll container. It gets `refetchAll`, `isFetching` and `isRefetchingAll` for a toolbar with a refresh button. `updateHeader` re-measures it right away, when its content changes in a way the list has to know about at once.

`WInfiniteListWrapper` is the same sticky header for any content, without a list:

```vue
<WInfiniteListWrapper>
  <template #header>
    <PageToolbar />
  </template>

  <ReportSections />
</WInfiniteListWrapper>
```

## Items

Besides `item` and `skeleton`, the default slot gets:

- `setter` — writes a changed item to the query cache, which updates it in every loaded page and every other query of the same model. Called with nothing, it removes the item.
- `refetch` — refetches this page and the pages after it, e.g. after an item moved.
- `previous` and `next` — the neighbouring items, across page borders; `first` and `last` for the ends of the list.
- `position` — the item's index in the whole list; `page` and `index` — its page and index in the page.

## Pages

A template ref gives `refetchAll`, `resetPage(page)` to start over from a page, and `goto(page, index)` to scroll to an item. A page that isn't rendered is rendered in its place, with the pages around it; before the list knows the page count, it starts over from the page instead.

`update:page` reports the page reached by scrolling. Keeping it in the URL and passing it back as `page` in `queryParams` opens the list at that page after a reload — the pages before it load when scrolling up.

## Long lists

However long the query, the list keeps only `maxPages` pages in the DOM. Pages scrolled past are dropped and leave a space of their height, and their queries stay cached, so scrolling back renders them again at once. Spacers above and below the rendered pages stand in for the rest, sized by the number of pages times the average height of those rendered, so the scrollbar covers the whole list from the first page on.

The demo below pages through 10,000 events, 50 at a time. The counter shows how many rows are in the DOM while scrolling. "Go to row" calls `goto` with the row's page and its index in the page, and the pages around it load in place.

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
| `pageClass` | `string` | — | Class of each page's element, e.g. a grid layout for the items. |
| `maxPages` | `number` | — | Number of pages kept rendered, 5 by default. Scrolling further drops pages at the other end, keeping their height as space. |
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

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `header` | `InfiniteListHeaderScope` | Content that sticks to the top while the page scrolls. `updateHeader` re-measures it right away. |
| `default` | `InfiniteListHeaderScope` | The scrolling content. Gets the header's `headerHeight` and `headerTop`. |

<!-- @api-end -->
