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

<DocsDemo name="recipes/plant-list/PlantList" overflow />

## Layout variables

The sticky header, the checkbox column and full-width rows position themselves from the app's layout variables — `--header-height`, `--nav-bar-width`, `--actions-bar-width` and `--inner-margin` — so the app has to set them (see [App shell](/guide/app-shell)). Inside a modal, the modal sets its own.

## Bulk actions

Above the table is the selection bar, `WButtonSelection`. While nothing is selected it shows the `action` components and the list settings; while items are selected, the `bulk` components and a "Selected N items" counter with a clear button. Actions that don't fit move into a More menu.

Each action is a component that renders a `WButtonSelectionAction` — an icon with a title, hidden on phones. A bulk action gets `BulkProps`: `selectionCount`, `queryParamsGetter()` for the query params narrowed to the selection, `readonly`, `disableMessage`, which disables the button with that text as its tooltip while nothing is selected, and `clearSelection()` to reset the selection when it is done.

Call `clearSelection` rather than emitting `clear:selected`, which still works but is deprecated. An action that doesn't fit the bar renders in the More menu, and a confirm opened from there takes the menu's place, unmounting the action — an emit after the confirm is accepted never arrives.

```vue
<template>
  <WButtonSelectionAction
    title="Archive"
    :icon="markRaw(IconArchiveBook)"
    :disable-message="disableMessage"
    :disabled="readonly"
    @click="archive"
  />
</template>

<script lang="ts" setup>
import {markRaw} from 'vue'

import type {BulkProps} from 'eco-vue-js/dist/components/List/types'

import WButtonSelectionAction from 'eco-vue-js/dist/components/Button/WButtonSelectionAction.vue'

import IconArchiveBook from 'eco-vue-js/dist/assets/icons/IconArchiveBook'

const props = defineProps<BulkProps<QueryParamsPlants>>()

const archive = () => plantApi.archive(props.queryParamsGetter()).then(() => props.clearSelection())
</script>
```

`WButtonUnselect` is the small round clear button of the select chips.

## Filters

`WListFilter` renders filter components for query params held in a Uniform form's `scope` — usually a form over the route query. Each filter is a component with a `meta` export (its `title`, `icon` and the `fields` it sets) that gets `scope`, `global` and `readonly`. `search` adds a text search for the `search` param, or `filterSearch` for your own.

In place, the filters are chips in a row: the set ones are shown, and a button adds another. With `global` they go into the app shell instead — the filters into the actions bar's panel and the search into the header bar — with a button that resets them. `disabledFilterFields` leaves out filters for params the page fixes. `pinned` filters are always shown, first, and their remove button only clears them. The [List with fields](/recipes/list-with-fields#filters) recipe builds a set of filters for its list.

`WListHeader` and `WListHeaderItem` are the table header row of the list, with the select-all checkbox and sortable, resizable column titles. `WList` renders them from `fields`.

### Filters in the selection bar

Put the `WListFilter` in WList's `filter` slot to show it at the start of the selection bar, on one line with the list actions and the list settings. Chips that do not fit go into a "more" chip that opens them as a list, and the list actions, which move to the end of the bar, fold into More before any chip does. While rows are selected, the selection with its bulk actions replaces the filters, so the bar keeps its height. On phones the filters take a row of their own above the actions, and the search narrows for them. `--w-list-toolbar-height` (`w-list-toolbar-h-*`) sets the height of the bar's inputs, chips and actions, by default the inherited input height.

Each chip names its filter and, when set, the picked values. A filter's `meta.summary` returns them from the query params, such as the titles of the picked options; without it the chip shows how many values are picked. A chip in the "more" list can be removed there too.

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
| `bulk` | `BulkComponent<QueryParams>[]` | — | Actions in the selection bar while items are selected. Each gets the selection count and a getter of the query params narrowed to the selection. The ones that do not fit the bar move into a More menu. |
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
| `filter` | — | Filters at the start of the selection bar, usually a WListFilter. They keep to one line, the chips that do not fit go to a menu, the list actions move to the end and fold into More first, and a selection replaces them. `--w-list-toolbar-height` sets the bar's height, the inherited input height by default. |
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

<!-- @api WButtonSelection -->

### WButtonSelection

```ts
import WButtonSelection from 'eco-vue-js/dist/components/Button/WButtonSelection.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `"item"` | Singular noun in the "Selected N items" counter. An "s" is added for more than one. |
| `disableMessage` | `string` | `"No selected items"` | Tooltip of the actions while nothing is selected, which also disables them. |
| `selectedCount` | `number` | — | Number of selected items. While it is above 0, the counter with a clear button replaces the `settings` slot. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `clear:selection` | — | The clear button of the counter was clicked. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `{ disableMessage: string \| undefined; cssClass: string; visibleCount: number; }` | WButtonSelectionAction buttons. Pass them `disableMessage`, and `cssClass` for the dividers between them. Hide the ones from `visibleCount` on, which do not fit — the `more` slot shows them instead. |
| `more` | `{ disableMessage: string \| undefined; cssClass: string; visibleCount: number; }` | Actions in the More menu at the end of the row: the ones of the `default` slot from `visibleCount` on, which do not fit the row. The menu shows only when some do not. |
| `filter` | — | Filters at the start of the bar while nothing is selected. The actions then move to the end, beside `settings`, and the selection replaces the filters. |
| `settings` | `{ isFilterShown: boolean; }` | Content at the end of the bar while nothing is selected, such as list settings. |

<!-- @api-end -->

<!-- @api WButtonSelectionAction -->

### WButtonSelectionAction

```ts
import WButtonSelectionAction from 'eco-vue-js/dist/components/Button/WButtonSelectionAction.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Text after the icon. Hidden on phones, except in the More menu. |
| `label` | `string` | — | Name for screen readers. Defaults to `tooltipText`, then `title`. |
| `icon` | `SVGComponent` | **required** | Icon of the action. |
| `disableMessage` | `string` | — | Disables the action and shows this text in its tooltip, e.g. "No selected items". |
| `disabled` | `boolean` | — | Disables the action. |
| `active` | `boolean` | — | Marks the action as on, e.g. a filter that is applied. |
| `loading` | `boolean` | — | Shows a spinner over the action and ignores clicks. |
| `tooltipText` | `string` | — | Tooltip text. |
| `to` | `RouteLocationRaw` | — | Router location — renders a router link. Needs vue-router installed in the app. |
| `tag` | `keyof HTMLElementTagNameMap` | — | Element rendered without `to`, e.g. `a` for a link with `href`. Defaults to `button`. |
| `href` | `string` | — | Link URL when `tag` is `a`. |
| `target` | `"_self" \| "_blank" \| "_parent" \| "_top"` | — | `target` attribute of the link. |
| `replace` | `boolean` | — | Replaces the current history entry instead of adding one, with `to`. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The action was clicked, unless it is disabled or loading. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Slot for absolute positioned content, like counter |
| `tooltip` | — | Rich content of the tooltip, replacing `disableMessage` or `tooltipText`. |

<!-- @api-end -->

<!-- @api WButtonSelectionState -->

### WButtonSelectionState

```ts
import WButtonSelectionState from 'eco-vue-js/dist/components/Button/WButtonSelectionState.vue'
```

#### Props

_No props._

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The clear button was clicked. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | The selection count, such as "Selected 3 items". |

<!-- @api-end -->

<!-- @api WButtonUnselect -->

### WButtonUnselect

```ts
import WButtonUnselect from 'eco-vue-js/dist/components/Button/WButtonUnselect.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | — | Disables the button. |
| `loading` | `boolean` | — | Ignores clicks, e.g. while the value is saving. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(value: MouseEvent)` | The button was clicked, unless it is disabled or loading. |
| `mousedown` | `(value: MouseEvent)` | A mouse button was pressed on it, unless it is disabled or loading. |

<!-- @api-end -->

<!-- @api WListFilter -->

### WListFilter

```ts
import WListFilter from 'eco-vue-js/dist/components/List/WListFilter.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scope` | `UniformScope<QueryParams>` | **required** | Scope of the Uniform form that holds the query params, usually synced with the route query. |
| `filter` | `FilterComponent<QueryParams>[]` | — | Filter components, one per filter, each with a `meta` export. A tuple adds props for it. |
| `pinned` | `FilterComponent<QueryParams>[]` | — | Filters of `filter` always shown as chips, first, instead of behind "Add filter". Their remove button only clears them. |
| `filterSearch` | `FilterComponent<QueryParams>` | — | Component for the search field, instead of the default text search on `search`. |
| `disabledFilterFields` | `(keyof QueryParams)[]` | — | Query params that can't be changed, e.g. fixed by the page. Their filters are left out. |
| `search` | `boolean` | — | Adds a search field for the `search` query param. |
| `global` | `boolean` | — | Puts the filters in the actions bar's filter panel and the search in the header bar, instead of in a row in place. |
| `readonly` | `boolean` | — | Shows the filters without changing them. |
| `searchVisible` | `boolean` | — | **Deprecated**: No effect: the search field is always shown in place, and behind the header's search button with `global`. |

<!-- @api-end -->

<!-- @api WListHeader -->

### WListHeader

```ts
import WListHeader from 'eco-vue-js/dist/components/List/WListHeader.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowSelect` | `boolean` | — | Shows the select-all checkbox. |
| `selectOnly` | `boolean` | — | Keeps the checkbox column's space without the checkbox, for lists without select-all. |
| `hideMore` | `boolean` | — | Narrows the end cap when the rows have no menu. |
| `disabled` | `boolean` | — | Disables the checkbox. |
| `count` | `number` | — | Total number of items. The checkbox is disabled while it is 0 or unknown. |
| `selection` | `boolean \| null` | — | State of the select-all checkbox: `true` for all, `null` for some, `false` for none. |
| `tooltipText` | `string` | **required** | Tooltip of the select-all checkbox. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:header` | — | The header was mounted or unmounted, for the sticky header to measure it. |
| `toggle:selection` | `(value: boolean)` | The select-all checkbox was toggled. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | WListHeaderItem cells, one per column. |
| `settings` | — | Content of the end cap, such as the column settings button. |

<!-- @api-end -->

<!-- @api WListHeaderItem -->

### WListHeaderItem

```ts
import WListHeaderItem from 'eco-vue-js/dist/components/List/WListHeaderItem.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Title of the column. The default slot replaces it. |
| `field` | `Field` | **required** | Ordering field of the column. Without it, the title isn't a sort button. |
| `ordering` | `OrderItem<Field>[]` | **required** | Current ordering, to show the column's direction and position in it. |
| `disabled` | `boolean` | — | Turns sorting off. |
| `allowResize` | `boolean` | — | Adds a handle to resize the column. |
| `itemClass` | `string` | — | Class of the title, replacing the default bold one-line style. |
| `styleValue` | `Record<string, string \| undefined>` | **required** | Style of the column, such as its width. |
| `hasWidth` | `boolean` | **required** | Whether the column has a width set, for the resize handle. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:width` | `(number)` | The column is being resized to this width. |
| `save:width` | — | Resizing ended, to save the width. |
| `update:ordering` | `(OrderItem<Field>[])` | The title was clicked: descending, then ascending, then off. Other columns stay in the ordering after it. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | Title of the column, replacing `title`. |

<!-- @api-end -->
