---
group: Data
aside: false
description: WList — paginated, sortable collections shown as a table on desktop and cards on mobile, with one field component per column.
---

# List

`WList` renders a paginated collection as a table on desktop and as cards on mobile. It owns pagination, selection, column settings (show, hide, reorder, resize) and ordering. You give it:

- `useQueryFn` and `queryParams` — a paginated query.
- `fields` — one component per column. Each has a `meta` export with its title, ordering field and CSS class, and renders one cell from `item`.
- `cardColumns` and `cardAreas` — the card layout as a CSS grid, with field labels as area names. Every field must appear in `cardAreas`, even ones hidden by default; a field left out renders in an extra grid column.
- Optionally an expansion component for a detail row and a menu component for row actions.

The [List with fields](/recipes/list-with-fields) recipe builds this step by step; the list below is its result.

<DocsDemo name="recipes/book-list/BookList" overflow />

## Layout variables

The sticky header, the checkbox column and full-width rows position themselves from the app's layout variables — `--header-height`, `--nav-bar-width`, `--actions-bar-width` and `--inner-margin` — so the app has to set them (see [App shell](/guide/app-shell)). Inside a modal, the modal sets its own.

## API

<!-- @api WList -->

### WList

```ts
import WList from 'eco-vue-js/dist/components/List/WList.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | — | Total number of items, when known in advance. Sizes the skeleton and the select-all. Defaults to the count the query returns. |
| `fields` | `Fields` | **required** | Field components, one per column, each with a `meta` export for its title, label, ordering field and classes. A meta with `fields` groups nested fields. |
| `expansion` | `ExpansionComponent<Data, QueryParams>` | — | Detail component shown under a row when the row is clicked. Receives the same props as a field, except `config`. |
| `useQueryFn` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query the pages are loaded with. |
| `useQueryFnExport` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | Paginated query for export, when it differs from `useQueryFn`. |
| `queryParams` | `QueryParams` | **required** | Params for `useQueryFn`. An `ordering` param drives the sort controls and the sortable column headers. |
| `queryOptions` | `DefaultQueryOptions<PaginatedResponse<Data>>` | — | Options for every page query. |
| `bulkDisableMessage` | `string` | — | Tooltip on the `bulk` actions while nothing is selected. Defaults to "No selected items". |
| `selectionTitle` | `string` | **required** | Singular noun in the "Selected N items" counter of the selection bar. |
| `bulk` | `BulkComponent<QueryParams>[]` | — | Actions in the selection bar while items are selected. Each gets the selection count and a getter of the query params narrowed to the selection. From the third on they move into a More menu. |
| `action` | `ActionComponent<QueryParams>[]` | — | Actions in the selection bar while nothing is selected, with the current query params. |
| `menu` | `MenuComponent<Data>[]` | — | Row menu items, opened by the row's more button or a right click. A `[component, props]` tuple passes extra props. |
| `readonlyGetter` | `((item: Data) => boolean)` | — | Makes a single row readonly. |
| `cardClass` | `string` | — | Classes for each row's content box. |
| `cardWrapperClass` | `string` | — | Classes for each row's outer box. |
| `selectAllTextGetter` | `(isUnselect: boolean, count: number) => string` | **required** | Tooltip of the select-all checkbox in the table header. |
| `hasBorder` | `boolean` | — | Draws a border around each row. |
| `configKey` | `string` | **required** | `localStorage` key the column settings and view mode are saved under. |
| `defaultConfigMap` | `FieldConfigMap<Fields>` | **required** | Width, visibility, order and stickiness of each field by label, until the user changes them. |
| `defaultMode` | `ListMode` | `ListMode.TABLE` | Table or grid view, until the user picks one. Small screens always show cards. |
| `alignTop` | `boolean` | — | Aligns cells and the checkbox to the top of the row instead of centering them. |
| `disableMore` | `boolean` | — | Disables the row menu, both the more button and the right click. |
| `readonly` | `boolean` | — | Makes every row readonly, and passes `readonly` to the `bulk`, `action` and `menu` components. When unset, inherits the readonly state provided by a parent. |
| `noOrdering` | `boolean` | — | Hides the sort control and makes the column headers not sortable. |
| `formFieldGetter` | `((data: Data, index: number) => string \| undefined)` | — | Wraps a row in WUniform for the returned field of `uniformScope`, so its fields can edit the item as part of a form. `undefined` leaves the row unwrapped. |
| `uniformScope` | `UniformScope<Data[]>` | — | Form scope of the items, for `formFieldGetter`. |
| `groupBy` | `((a: Data, b: Data) => boolean)` | — | Whether two neighbouring items are in the same group. The `group` slot renders before each new group. |
| `cardColumns` | `CardColumns` | **required** | Column widths of the card grid. |
| `cardAreas` | `CardAreas<Fields, CardColumns["length"]>` | **required** | Rows of the card grid, as area names: field labels, `AREA_SELECT`, `AREA_MORE` or `.`. Areas of hidden fields are dropped, and so are rows and columns left empty. |
| `cardTo` | `((item: Data) => RouteLocationRaw \| undefined)` | — | Route a row links to. |
| `hasAction` | `boolean` | — | Makes a row click emit `click:action`. |
| `noHeaderSettings` | `boolean` | — | Hides the column settings button, and neither loads nor saves column settings. |
| `noRefetch` | `boolean` | — | Hides the refetch button. |
| `refetchInterval` | `number` | — | Refetches the loaded pages every this many ms. |
| `apiMethodExport` | `((queryParams: QueryParams) => Promise<Data[]>)` | — | Loads the items to export in one call, instead of paging through the export query. |
| `exportFileName` | `string` | — | Name of the exported file. |
| `disableExport` | `boolean` | — | Hides the export button. Rows are then selectable only with `bulk` or `alwaysSelect`. |
| `alwaysSelect` | `boolean` | — | Shows the checkboxes even without `bulk` or export, and makes a row click toggle its selection. With `cardTo`, the row link moves into a View menu item. |
| `selection` | `Selection<number>` | — | Selected items, controlled from outside with `update:selection`. By default the selection is kept in the URL hash. |
| `noHeaderUpdate` | `boolean` | — | Keeps the sticky list header out of the app header bar's padding while scrolled. |
| `minHeight` | `boolean` | — | Drops the full-screen minimum height and the bottom padding, for a list inside other content. |
| `toMarkdown` | `((data: Data, index: number) => string)` | — | Converts an item to Markdown. Adds a Copy as Markdown item to the row menu and a Markdown option to export. |
| `noMode` | `boolean` | — | Hides the table and grid switch in the column settings. |
| `disableSelect` | `boolean` | — | Hides the checkboxes and turns selection off. |
| `selectOnly` | `boolean` | — | Allows only picking rows one by one — no select-all and no Shift range selection. |
| `contentVisibility` | `boolean` | — | Skips rendering rows outside the viewport with `content-visibility: auto`, for long lists. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:error` | `(ApiError<{}, ErrorResponse<{}>>)` | A page query failed. |
| `click:action` | `(CardActionParams<Data>)` | A row was clicked, with `hasAction`. Carries the item, a setter that replaces it and its form scope. |
| `update:query-params` | `(QueryParams)` | The changed params only — the new `ordering`, from the sort control or a column header. |
| `update:count` | `(number \| undefined)` | Total count returned by the query. |
| `update:selection` | `(Selection<number>)` | The new selection, with `selection`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `header` | `{ count: number \| undefined; }` | Content above the selection bar, with the count returned by the query. |
| `selection` | — | Replaces the buttons at the end of the selection bar — range select, refetch, sort and column settings. |
| `group` | `{ item: Data; previous: Data \| undefined; skeleton: boolean; }` | Heading before each group of rows, with `groupBy`. `skeleton` is true while the page loads. |
| `empty` | — | Shown instead of the rows when the query returns no items. |

<!-- @api-end -->

<!-- @api WListCardField -->

### WListCardField

```ts
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | — | Value shown as truncated text. The `inner` and `default` slots replace it. |
| `skeleton` | `boolean` | — | Shows a placeholder instead of the content. |
| `allowOpen` | `boolean` | — | Lets clicks through to the row, so they open its expansion. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Replaces the whole content, including the truncating wrapper. |
| `inner` | — | Replaces `modelValue` inside the truncating wrapper. |

<!-- @api-end -->
