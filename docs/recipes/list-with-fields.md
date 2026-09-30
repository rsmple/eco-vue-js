---
group: Recipes
aside: false
description: Build a paginated, sortable, searchable WList on a createRestModelApi model, with one component per column, filters kept in the URL, an expansion row and a row menu that calls the model's actions — the pattern used for every data table in eco-vue-js apps.
---

# List with fields

**Problem:** a paginated collection needs a table on desktop and cards on mobile, sortable and resizable columns the user can show, hide and reorder, per-row actions, and an expandable detail row — without each list re-implementing any of that.

**Pattern:** `WList` owns layout, pagination, selection, column settings and ordering. You supply:

| Piece | What it is |
| --- | --- |
| A model | `createRestModelApi` with a paginated query, whose `use` is the list's `useQueryFn`, and the actions that change an item. |
| Filters | `createUseQueryParams`, which keeps the user's search and ordering in the URL. |
| Field components | One `.vue` per column. The component renders the cell; its exported `meta` declares the label, width, title and sort field. |
| A fields index | The ordered tuple of field modules plus the default column config. |
| Menu components | Row actions, typed with `MenuProps<T>` / `MenuEmits<T>`. |
| An expansion component | Optional detail row, opened from the field marked `allow-open`. |

<!-- @example recipes/book-list/BookList overflow -->

<DocsDemo name="recipes/book-list/BookList" overflow />

```vue
<template>
  <WInput
    :model-value="queryParams.search"
    type="search"
    placeholder="Search by title or author"
    :icon="markRaw(IconSearch)"
    allow-clear
    no-margin
    class="sticky left---left-inner mb-4 w---width-inner"
    @update:model-value="updateQueryParams({search: $event || undefined})"
  />

  <WList
    :use-query-fn="bookModelApi.paginated.use"
    :query-params="queryParams"
    :fields="listFieldsBook"
    :default-config-map="defaultFieldConfigMapBook"
    config-key="w-list-docs-book"
    :expansion="markRaw(BookContent)"
    :menu="[
      markRaw(WMenuBookToggle),
      markRaw(WMenuBookDelete),
    ]"
    selection-title="book"
    :select-all-text-getter="selectAllTextGetter"
    :card-columns="(['minmax(0rem, 1fr)', 'auto', 'auto'] as const)"
    :card-areas="[
      ['title', 'title', 'area_select'],
      ['author','author', 'area_more'],
      ['year', 'rating', 'rating'],
      ['available', 'due', 'due'],
      ['pages', 'loans', 'loans'],
      ['genre', 'genre', 'genre'],
    ]"
    card-class="list:h-11 card:gap-2 sm:card:p-4 sm-not:card:py-3 sm:card:w-list-rounded-xl sm:card:border sm:card:shadow-sm border-gray-100 dark:border-gray-800"
    card-wrapper-class="card:self-start"
    min-height
    class="sm:w-list-gap-3"
    @update:query-params="updateQueryParams"
  />
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WList from 'eco-vue-js/dist/components/List/WList.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

import BookContent from './BookContent.vue'
import {bookModelApi, useQueryParamsBooks} from './api/Book'
import {defaultFieldConfigMapBook, listFieldsBook} from './fields'
import WMenuBookDelete from './menu/WMenuBookDelete.vue'
import WMenuBookToggle from './menu/WMenuBookToggle.vue'

// The docs have no router, so the filters stay in the page. In an app, keep them in the URL: `useQueryParamsBooks(useRoute())`.
const {queryParams, updateQueryParams} = useQueryParamsBooks.useQueryParamsLocal()

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } books`
</script>
```

<!-- @example-end -->

Try sorting by a column header, resizing Title, hiding columns from the header settings, switching to cards, expanding a row and using the `⋯` menu. The data is in memory here, behind the same model API a real endpoint would use.

## The code

### Model and filters

The model is the only piece that knows where data comes from — see [Data layer](/guide/data-layer) for the whole API. `WList` calls `bookModelApi.paginated.use` with `{...queryParams, page}` for each page and expects a `PaginatedResponse<T>`. Here each request is answered from an array in memory; in an app it goes through your `apiClient`.

The item query holds the actions the menu calls. `update` puts the saved book into every cached page that holds it, and `delete` returns `() => null` to drop the book from them.

`useQueryParamsBooks` declares the filters the user sets: `search` and `ordering`. Leave `page` out — the list adds it to each page's query. The docs have no router, so the demo keeps the filters in the page with `useQueryParamsLocal()`. In an app, pass the route, and the filters live in the URL:

```ts
const {queryParams, updateQueryParams} = useQueryParamsBooks(useRoute())
```

::: code-group

<!-- @source docs/examples/recipes/book-list/models/Book.ts models/Book.ts -->

```ts [models/Book.ts]
import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

export enum Genre {
  NOVEL = 'novel',
  SCIENCE = 'science',
  HISTORY = 'history',
  POETRY = 'poetry',
}

export type Book = {
  id: number
  title: string
  author: string
  genre: Genre
  year: number
  available: boolean
  /** Average reader rating, from 1 to 5. */
  rating: number
  /** How many times the book has been borrowed. */
  loans: number
  pages: number
  /** When a borrowed book is due back; `null` while it is available. */
  dueAt: Date | null
  description: string
}

const SOURCE: [string, string, Genre, number][] = [
  ['Moby-Dick', 'Herman Melville', Genre.NOVEL, 1851],
  ['Pride and Prejudice', 'Jane Austen', Genre.NOVEL, 1813],
  ['On the Origin of Species', 'Charles Darwin', Genre.SCIENCE, 1859],
  ['Leaves of Grass', 'Walt Whitman', Genre.POETRY, 1855],
  ['The History of the Decline and Fall of the Roman Empire', 'Edward Gibbon', Genre.HISTORY, 1776],
  ['Frankenstein', 'Mary Shelley', Genre.NOVEL, 1818],
  ['Middlemarch', 'George Eliot', Genre.NOVEL, 1871],
  ['Principia', 'Isaac Newton', Genre.SCIENCE, 1687],
  ['The Waste Land', 'T. S. Eliot', Genre.POETRY, 1922],
  ['The Histories', 'Herodotus', Genre.HISTORY, -430],
  ['Jane Eyre', 'Charlotte Brontë', Genre.NOVEL, 1847],
  ['Wuthering Heights', 'Emily Brontë', Genre.NOVEL, 1847],
  ['Dialogue Concerning the Two Chief World Systems', 'Galileo Galilei', Genre.SCIENCE, 1632],
  ['Songs of Innocence and of Experience', 'William Blake', Genre.POETRY, 1789],
  ['The Prince', 'Niccolò Machiavelli', Genre.HISTORY, 1532],
  ['Great Expectations', 'Charles Dickens', Genre.NOVEL, 1861],
  ['Anna Karenina', 'Leo Tolstoy', Genre.NOVEL, 1878],
  ['Micrographia', 'Robert Hooke', Genre.SCIENCE, 1665],
  ['The Raven', 'Edgar Allan Poe', Genre.POETRY, 1845],
  ['History of the Peloponnesian War', 'Thucydides', Genre.HISTORY, -400],
  ['Don Quixote', 'Miguel de Cervantes', Genre.NOVEL, 1605],
  ['Crime and Punishment', 'Fyodor Dostoevsky', Genre.NOVEL, 1866],
  ['The Descent of Man', 'Charles Darwin', Genre.SCIENCE, 1871],
  ['Paradise Lost', 'John Milton', Genre.POETRY, 1667],
  ['The Annals', 'Tacitus', Genre.HISTORY, 109],
  ['Madame Bovary', 'Gustave Flaubert', Genre.NOVEL, 1857],
  ['The Picture of Dorian Gray', 'Oscar Wilde', Genre.NOVEL, 1890],
  ['Opticks', 'Isaac Newton', Genre.SCIENCE, 1704],
  ['Sonnets', 'William Shakespeare', Genre.POETRY, 1609],
  ['The Gallic War', 'Julius Caesar', Genre.HISTORY, -50],
]

/** In-memory stand-in for a REST collection. */
export const books: Book[] = SOURCE.map(([title, author, genre, year], index) => ({
  id: index + 1,
  title,
  author,
  genre,
  year,
  available: index % 3 !== 0,
  rating: 3 + (index * 13 % 21) / 10,
  loans: 40 + index * 7919 % 4800,
  pages: 120 + index * 97 % 900,
  // Some borrowed books are overdue.
  dueAt: index % 3 === 0 ? addDay(getStartOfDay(), index * 5 % 30 - 7) : null,
  description: `${ title } by ${ author }, first published ${ year < 0 ? `around ${ -year } BC` : `in ${ year }` }.`,
}))
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/book-list/api/Book.ts api/Book.ts -->

```ts [api/Book.ts]
import {createUseQueryParams} from 'eco-vue-js/dist/utils/api'
import {Order, parseOrdering} from 'eco-vue-js/dist/utils/order'
import {createRestModelApi} from 'eco-vue-js/dist/utils/restModelApi'
import {paginateList} from 'eco-vue-js/dist/utils/useDefaultQuery'
import {isId, parseString} from 'eco-vue-js/dist/utils/utils'

import {type Book, books} from '../models/Book'

/** The filters a user sets on the list. In an app they are kept in the URL. */
export const useQueryParamsBooks = createUseQueryParams({
  search: parseString,
  ordering: parseString,
})

export type QueryParamsBooks = typeof useQueryParamsBooks['QueryParams'] & {
  page?: number
  /** Comma-separated ids — how async selects look up the items behind their model value. */
  id__in?: string
}

let source = books

/** Stands in for a request to the API: answers after a moment with a copy of the data. */
const respond = <Data>(handler: () => Data) => new Promise<Data>(resolve => {
  setTimeout(() => resolve(structuredClone(handler())), 300)
})

const toSortable = (value: Book[keyof Book]) => value instanceof Date ? value.getTime() : value

/** Sorts in `direction`, with empty values last either way. */
const compare = (a: Book, b: Book, field: keyof Book, direction: 1 | -1) => {
  const left = toSortable(a[field])
  const right = toSortable(b[field])

  if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1

  return direction * (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right)))
}

/** Filters and sorts by the same query params a backend would receive. */
const filterBooks = (queryParams: QueryParamsBooks | undefined) => {
  const search = queryParams?.search?.trim().toLowerCase()
  const ids = queryParams?.id__in?.split(',').map(Number)
  let result = search
    ? source.filter(book => book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search))
    : source

  if (ids) result = result.filter(book => ids.includes(book.id))

  if (queryParams?.ordering) {
    const [{field, order}] = parseOrdering<keyof Book>(queryParams.ordering)

    result = result.toSorted((a, b) => compare(a, b, field, order === Order.DESC ? -1 : 1))
  }

  return result
}

export const bookModelApi = createRestModelApi({
  modelKey: 'Book',
  model: {} as Book,
  queries: {
    item: {
      scope: 'item',
      dataType: {} as Book,
      isQueryParams: isId,
      queryFn: ({queryKey}) => respond(() => source.find(book => book.id === queryKey[2])!),
      actions: {
        // In an app, a PATCH to `/books/<id>/`.
        update: ({set}, id, payload: Partial<Book>) => respond(() => {
          source = source.map(book => book.id === id ? {...book, ...payload} : book)

          return source.find(book => book.id === id)!
        })
          .then(book => {
            // Puts the saved book into every cached page that holds it.
            set(book)

            return book
          }),

        // In an app, a DELETE to `/books/<id>/`.
        delete: (context, id) => respond(() => {
          source = source.filter(book => book.id !== id)
        })
          // Drops the book from every cached page.
          .then(() => () => null),
      },
    },

    paginated: {
      scope: 'paginated',
      dataType: {} as PaginatedResponse<Book>,
      isQueryParams: (value: unknown): value is QueryParamsBooks | undefined => value === undefined || value instanceof Object,
      // In an app, a GET to `/books/` with the query params.
      queryFn: ({queryKey}) => respond(() => paginateList(filterBooks(queryKey[2]), queryKey[2]?.page, 10)),
    },
  },
})
```

<!-- @source-end -->

:::

### Fields

Each field is a module with two exports: the component (default) renders the cell, and `meta` describes the column. Keep both in one file — the column cannot drift from what it renders.

- `label` is the column's stable id: it keys the saved column config and names the area in `cardAreas`.
- `field` makes the column sortable — its value is sent as `ordering` (`year`, `-year`).
- `textFormat` gives a plain-text value for CSV export and "copy as Markdown", for cells that render components or format the value for display — like the due date, which is shown short and exported in full.
- `allow-open` on `WListCardField` makes that cell toggle the expansion row.

::: code-group

<!-- @source docs/examples/recipes/book-list/fields/WFieldBookTitle.vue WFieldBookTitle.vue -->

```vue [WFieldBookTitle.vue]
<template>
  <WListCardField
    :model-value="item.title"
    :skeleton="skeleton"
    allow-open
    class="font-semibold"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'title',
  cssClass: 'flex-1 basis-[12rem]',
  title: 'Title',
  field: 'title',
  allowResize: true,
} as const satisfies ListField<Book>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/book-list/fields/WFieldBookStatus.vue WFieldBookStatus.vue -->

```vue [WFieldBookStatus.vue]
<template>
  <WListCardField :skeleton="skeleton">
    <WChip
      :text="item.available ? 'Available' : 'Borrowed'"
      :semantic-type="item.available ? SemanticType.POSITIVE : SemanticType.WARNING"
      :skeleton="skeleton"
    />
  </WListCardField>
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import WChip from 'eco-vue-js/dist/components/Chip/WChip.vue'
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()
</script>

<script lang="ts">
export const meta = {
  label: 'available',
  cssClass: 'basis-[7rem]',
  title: 'Status',
  field: 'available',
  textFormat: item => item.available ? 'Available' : 'Borrowed',
} as const satisfies ListField<Book>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/book-list/fields/WFieldBookDue.vue WFieldBookDue.vue -->

```vue [WFieldBookDue.vue]
<template>
  <WListCardField
    :model-value="item.dueAt ? dateFormatShort(item.dueAt) : '—'"
    :skeleton="skeleton"
    :class="{
      'text-description': !item.dueAt,
      'text-negative dark:text-negative-dark': item.dueAt && item.dueAt < today,
    }"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import type {FieldProps, ListField} from 'eco-vue-js/dist/components/List/types'
import {dateFormat, dateFormatShort, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'

defineProps<FieldProps<Book>>()

defineEmits<{
  (e: 'update:item', value: Book): void
  (e: 'delete:item'): void
}>()

// Overdue books are shown in red.
const today = getStartOfDay()
</script>

<script lang="ts">
export const meta = {
  label: 'due',
  cssClass: 'basis-[6rem]',
  title: 'Due',
  field: 'dueAt',
  textFormat: item => item.dueAt ? dateFormat(item.dueAt) : undefined,
} as const satisfies ListField<Book>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/book-list/fields/index.ts fields/index.ts -->

```ts [fields/index.ts]
import type {QueryParamsBooks} from '../api/Book'
import type {Book} from '../models/Book'

import type {ListFields} from 'eco-vue-js/dist/components/List/types'
import {getDefaultFieldConfigMap} from 'eco-vue-js/dist/utils/utils'

import * as FieldBookAuthor from './WFieldBookAuthor.vue'
import * as FieldBookDue from './WFieldBookDue.vue'
import * as FieldBookGenre from './WFieldBookGenre.vue'
import * as FieldBookLoans from './WFieldBookLoans.vue'
import * as FieldBookPages from './WFieldBookPages.vue'
import * as FieldBookRating from './WFieldBookRating.vue'
import * as FieldBookStatus from './WFieldBookStatus.vue'
import * as FieldBookTitle from './WFieldBookTitle.vue'
import * as FieldBookYear from './WFieldBookYear.vue'

export const listFieldsBook = [
  FieldBookTitle,
  FieldBookAuthor,
  FieldBookGenre,
  FieldBookYear,
  FieldBookPages,
  FieldBookRating,
  FieldBookLoans,
  FieldBookStatus,
  FieldBookDue,
] as const satisfies ListFields<Book, QueryParamsBooks>

// Columns shown until the user changes them in the header settings. `genre`, `pages` and `loans` start hidden.
export const defaultFieldConfigMapBook = getDefaultFieldConfigMap(listFieldsBook, [
  'title',
  'author',
  'year',
  'rating',
  'available',
  'due',
])
```

<!-- @source-end -->

:::

`as const satisfies ListFields<…>` keeps the tuple literal, which is what lets TypeScript check the labels in `getDefaultFieldConfigMap` and `cardAreas` — a typo in either is a type error.

### Row menu

Menu items receive the row and call the model's actions. The actions update the cached pages themselves, so the list changes without a refetch. The menu also gets `updateItem` and `deleteItem`, which write the row to the cache or remove it without a request — e.g. to drop a row that was never saved.

Always type menu components with `MenuProps<T>` and `MenuEmits<T>` from the kit — a hand-written props shape breaks when the kit adds a prop.

::: code-group

<!-- @source docs/examples/recipes/book-list/menu/WMenuBookToggle.vue WMenuBookToggle.vue -->

```vue [WMenuBookToggle.vue]
<template>
  <WButtonMoreItem
    :text="item.available ? 'Mark as borrowed' : 'Mark as returned'"
    :icon="markRaw(item.available ? IconArchiveBook : IconCheckCircle)"
    :disabled="readonly"
    @click="toggle"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {Notify} from 'eco-vue-js/dist/utils/Notify'
import {handleApiError} from 'eco-vue-js/dist/utils/api'
import {addDay, getStartOfDay} from 'eco-vue-js/dist/utils/dateTime'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconCheckCircle from 'eco-vue-js/dist/assets/icons/IconCheckCircle'

import {bookModelApi} from '../api/Book'

const props = defineProps<MenuProps<Book>>()

defineEmits<MenuEmits<Book>>()

const toggle = () => bookModelApi.item.actions
  // The action puts the saved book into every cached page that holds it, so the row updates without a refetch.
  .update(props.item.id, {
    available: !props.item.available,
    // Borrowed for two weeks.
    dueAt: props.item.available ? addDay(getStartOfDay(), 14) : null,
  })
  .then(book => Notify.success({title: book.available ? 'Marked as returned' : 'Marked as borrowed'}))
  .catch(handleApiError)
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/book-list/menu/WMenuBookDelete.vue WMenuBookDelete.vue -->

```vue [WMenuBookDelete.vue]
<template>
  <WButtonMoreItem
    text="Remove"
    :icon="markRaw(IconTrash)"
    :disabled="readonly"
    @click="remove"
  />
</template>

<script lang="ts" setup>
import type {Book} from '../models/Book'

import {markRaw} from 'vue'

import type {MenuEmits, MenuProps} from 'eco-vue-js/dist/components/List/types'
import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'
import {handleApiError} from 'eco-vue-js/dist/utils/api'

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

import {bookModelApi} from '../api/Book'

const props = defineProps<MenuProps<Book>>()

defineEmits<MenuEmits<Book>>()

const remove = () => {
  Modal.addConfirm({
    title: 'Remove book',
    description: `"${ props.item.title }" will be removed from the catalogue.`,
    acceptText: 'Remove',
    acceptSemanticType: SemanticType.NEGATIVE,
    // The modal shows a loading state until the action resolves, which also drops the book from every cached page.
    onAccept: () => bookModelApi.item.actions.delete(props.item.id).catch(handleApiError),
  })
}
</script>
```

<!-- @source-end -->

:::

`Modal.addConfirm` keeps the dialog open with a spinner while `onAccept`'s promise is pending, closes it when the promise resolves, and leaves it open if it rejects — so return the action's promise.

### Expansion

<!-- @source docs/examples/recipes/book-list/BookContent.vue BookContent.vue -->

```vue [BookContent.vue]
<template>
  <div class="py-4">
    <WSkeleton v-if="skeleton || !item" />

    <p
      v-else
      class="text-description"
    >
      {{ item.description }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type {QueryParamsBooks} from './api/Book'
import type {Book} from './models/Book'

import type {FieldProps} from 'eco-vue-js/dist/components/List/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<Omit<FieldProps<Book | undefined, QueryParamsBooks>, 'config'>>()
</script>
```

<!-- @source-end -->

## Why it is built this way

- **One component per column** makes columns reusable across lists of the same model, lets each cell own its formatting and loading state, and keeps the column list declarative, so `WList` can reorder, hide and resize columns without knowing what they render.
- **Query params are the whole state.** Search, filters and ordering go into `queryParams`; `WList` adds `page` and emits `update:query-params` when the user sorts. With `createUseQueryParams` they live in the route query, so the list is linkable and survives reloads.
- **Card layout is data, not markup.** `cardColumns` and `cardAreas` place the same field components into a CSS grid for the mobile card view, using the field labels as area names. `area_select` and `area_more` place the checkbox and the menu. Name every field, including ones hidden by default: a field left out still renders in card mode, in an extra column the grid adds for it. A row whose fields are all hidden drops out, so the `pages`/`loans` and `genre` rows cost nothing until the user shows those columns.
- **Cache updates instead of refetching.** The model's actions update the item in every cached page, so the user keeps their scroll position and loaded pages.

## Variations

- **Bulk actions**: pass `bulk` with components typed by `BulkProps<QueryParams>`; they get a `queryParamsGetter` that describes the current selection.
- **Toolbar actions** (e.g. "Create"): pass `action` with components typed by `ActionProps<QueryParams>`.
- **Nested columns**: a field's `meta` can be `{keyEntity, fields}` or `{keyArray, fields}` to render columns of a related object or of every item in an array.
- **Embedded lists**: a list is sized as a page by default — it reserves the viewport height. Inside a card, tab or docs page like this one, pass `min-height` to drop that.
- **Read-only rows**: `readonlyGetter` marks individual rows read-only; menu items receive `readonly` and should disable themselves.
