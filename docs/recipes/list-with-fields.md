---
group: Recipes
aside: false
description: Build a paginated, sortable, searchable WList with one component per column, an expansion row and a row menu — the pattern used for every data table in eco-vue-js apps.
---

# List with fields

**Problem:** a paginated collection needs a table on desktop and cards on mobile, sortable and resizable columns the user can show, hide and reorder, per-row actions, and an expandable detail row — without each list re-implementing any of that.

**Pattern:** `WList` owns layout, pagination, selection, column settings and ordering. You supply:

| Piece | What it is |
| --- | --- |
| A query hook | Fetches one page for the given query params (`useQueryFn`). |
| Field components | One `.vue` per column. The component renders the cell; its exported `meta` declares the label, width, title and sort field. |
| A fields index | The ordered tuple of field modules plus the default column config. |
| Menu components | Row actions, typed with `MenuProps<T>` / `MenuEmits<T>`. |
| An expansion component | Optional detail row, opened from the field marked `allow-open`. |

<!-- @example recipes/book-list/BookList client -->

<DocsDemo name="recipes/book-list/BookList" client-only />

```vue
<template>
  <WInput
    v-model="search"
    type="search"
    placeholder="Search by title or author"
    :icon="markRaw(IconSearch)"
    allow-clear
    no-margin
    class="mb-4"
  />

  <WList
    :use-query-fn="useQueryBooks"
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
    :card-columns="(['1fr', 'auto'] as const)"
    :card-areas="[
      ['title', 'area_select'],
      ['author', 'area_more'],
      ['year', 'available'],
    ]"
    min-height
    @update:query-params="ordering = $event.ordering"
  />
</template>

<script lang="ts" setup>
import type {QueryParamsBooks} from './models/Book'

import {computed, markRaw, ref} from 'vue'

import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
import WList from 'eco-vue-js/dist/components/List/WList.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

import BookContent from './BookContent.vue'
import {useQueryBooks} from './api/Book'
import {defaultFieldConfigMapBook, listFieldsBook} from './fields'
import WMenuBookDelete from './menu/WMenuBookDelete.vue'
import WMenuBookToggle from './menu/WMenuBookToggle.vue'

// In an app these usually live in the route query, so the list state survives reloads and can be shared.
const search = ref<string | undefined | null>()
const ordering = ref<string>()

const queryParams = computed<QueryParamsBooks>(() => ({
  search: search.value || undefined,
  ordering: ordering.value,
}))

const selectAllTextGetter = (isUnselect: boolean, count: number) => `${ isUnselect ? 'Unselect' : 'Select' } all ${ count } books`
</script>
```

<!-- @example-end -->

Try sorting by a column header, resizing Title, hiding columns from the header settings, switching to cards, expanding a row and using the `⋯` menu. The data is in memory here — the list talks to it through the same query-hook interface a real endpoint would use.

## The code

### Model and query hook

The query hook is the only piece that knows where data comes from. `WList` calls it with `{...queryParams, page}` and expects a `PaginatedResponse<T>`. Here `makeQueryPaginated` serves an in-memory array; in an app this is a request to your API.

::: code-group

<!-- @source docs/examples/recipes/book-list/models/Book.ts models/Book.ts -->

```ts [models/Book.ts]
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
  description: string
}

export type QueryParamsBooks = {
  page?: number
  ordering?: string
  search?: string
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
  description: `${ title } by ${ author }, first published ${ year < 0 ? `around ${ -year } BC` : `in ${ year }` }.`,
}))
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/book-list/api/Book.ts api/Book.ts -->

```ts [api/Book.ts]
import {Order, parseOrdering} from 'eco-vue-js/dist/utils/order'
import {makeQueryPaginated} from 'eco-vue-js/dist/utils/useDefaultQuery'

import {type Book, type QueryParamsBooks, books} from '../models/Book'

let source = books

const compare = (a: Book, b: Book, field: keyof Book) => {
  const left = a[field]
  const right = b[field]

  return typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
}

/**
 * Stands in for a paginated endpoint: filters and sorts by the same query params a backend would receive.
 * In an app this is a request to the API — the list component does not know the difference.
 */
export const useQueryBooks = makeQueryPaginated<Book, QueryParamsBooks>(
  'book',
  queryParams => {
    const search = queryParams.search?.trim().toLowerCase()
    let result = search
      ? source.filter(book => book.title.toLowerCase().includes(search) || book.author.toLowerCase().includes(search))
      : source

    if (queryParams.ordering) {
      const [{field, order}] = parseOrdering<keyof Book>(queryParams.ordering)

      result = result.toSorted((a, b) => compare(a, b, field) * (order === Order.DESC ? -1 : 1))
    }

    return result
  },
  list => source = list,
  10,
)
```

<!-- @source-end -->

:::

### Fields

Each field is a module with two exports: the component (default) renders the cell, and `meta` describes the column. Keep both in one file — the column cannot drift from what it renders.

- `label` is the column's stable id: it keys the saved column config and names the area in `cardAreas`.
- `field` makes the column sortable — its value is sent as `ordering` (`year`, `-year`).
- `textFormat` gives a plain-text value for CSV export and "copy as Markdown", for cells that render components.
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
  cssClass: 'basis-[8rem]',
  title: 'Status',
  field: 'available',
  textFormat: item => item.available ? 'Available' : 'Borrowed',
} as const satisfies ListField<Book>
</script>
```

<!-- @source-end -->

<!-- @source docs/examples/recipes/book-list/fields/index.ts fields/index.ts -->

```ts [fields/index.ts]
import type {Book, QueryParamsBooks} from '../models/Book'

import type {ListFields} from 'eco-vue-js/dist/components/List/types'
import {getDefaultFieldConfigMap} from 'eco-vue-js/dist/utils/utils'

import * as FieldBookAuthor from './WFieldBookAuthor.vue'
import * as FieldBookGenre from './WFieldBookGenre.vue'
import * as FieldBookStatus from './WFieldBookStatus.vue'
import * as FieldBookTitle from './WFieldBookTitle.vue'
import * as FieldBookYear from './WFieldBookYear.vue'

export const listFieldsBook = [
  FieldBookTitle,
  FieldBookAuthor,
  FieldBookGenre,
  FieldBookYear,
  FieldBookStatus,
] as const satisfies ListFields<Book, QueryParamsBooks>

// Columns shown until the user changes them in the header settings. `genre` starts hidden.
export const defaultFieldConfigMapBook = getDefaultFieldConfigMap(listFieldsBook, [
  'title',
  'author',
  'year',
  'available',
])
```

<!-- @source-end -->

:::

`as const satisfies ListFields<…>` keeps the tuple literal, which is what lets TypeScript check the labels in `getDefaultFieldConfigMap` and `cardAreas` — a typo in either is a type error.

### Row menu

Menu items receive the row and two callbacks. `updateItem` writes the new item into every cached page that holds it; `deleteItem` removes it. Call them with what the server returned, so the list updates without refetching.

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

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'
import IconCheckCircle from 'eco-vue-js/dist/assets/icons/IconCheckCircle'

const props = defineProps<MenuProps<Book>>()

defineEmits<MenuEmits<Book>>()

const toggle = () => {
  // In an app this is the PATCH response; `updateItem` puts it into every cached page that holds the item.
  props.updateItem({...props.item, available: !props.item.available})

  Notify.success({title: props.item.available ? 'Marked as borrowed' : 'Marked as returned'})
}
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

import WButtonMoreItem from 'eco-vue-js/dist/components/Button/WButtonMoreItem.vue'

import IconTrash from 'eco-vue-js/dist/assets/icons/IconTrash'

const props = defineProps<MenuProps<Book>>()

defineEmits<MenuEmits<Book>>()

const remove = () => {
  Modal.addConfirm({
    title: 'Remove book',
    description: `"${ props.item.title }" will be removed from the catalogue.`,
    acceptText: 'Remove',
    acceptSemanticType: SemanticType.NEGATIVE,
    // In an app, await the DELETE request here — the modal shows a loading state until it resolves.
    onAccept: () => props.deleteItem(),
  })
}
</script>
```

<!-- @source-end -->

:::

`Modal.addConfirm` keeps the dialog open with a spinner while `onAccept`'s promise is pending, closes it when the promise resolves, and leaves it open if it rejects — so return the request's promise.

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
import type {Book, QueryParamsBooks} from './models/Book'

import type {FieldProps} from 'eco-vue-js/dist/components/List/types'

import WSkeleton from 'eco-vue-js/dist/components/Skeleton/WSkeleton.vue'

defineProps<Omit<FieldProps<Book | undefined, QueryParamsBooks>, 'config'>>()
</script>
```

<!-- @source-end -->

## Why it is built this way

- **One component per column** makes columns reusable across lists of the same model, lets each cell own its formatting and loading state, and keeps the column list declarative, so `WList` can reorder, hide and resize columns without knowing what they render.
- **Query params are the whole state.** Search, filters and ordering go into `queryParams`; `WList` adds `page` and emits `update:query-params` when the user sorts. Store them in the route query and the list becomes linkable and survives reloads.
- **Card layout is data, not markup.** `cardColumns` and `cardAreas` place the same field components into a CSS grid for the mobile card view, using the field labels as area names. `area_select` and `area_more` place the checkbox and the menu.
- **Cache updates instead of refetching.** Menus update the item in place, so the user keeps their scroll position and loaded pages.

## Variations

- **Bulk actions**: pass `bulk` with components typed by `BulkProps<QueryParams>`; they get a `queryParamsGetter` that describes the current selection.
- **Toolbar actions** (e.g. "Create"): pass `action` with components typed by `ActionProps<QueryParams>`.
- **Nested columns**: a field's `meta` can be `{keyEntity, fields}` or `{keyArray, fields}` to render columns of a related object or of every item in an array.
- **Embedded lists**: a list is sized as a page by default — it reserves the viewport height. Inside a card, tab or docs page like this one, pass `min-height` to drop that.
- **Read-only rows**: `readonlyGetter` marks individual rows read-only; menu items receive `readonly` and should disable themselves.
