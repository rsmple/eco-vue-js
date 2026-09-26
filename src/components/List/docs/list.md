---
group: Data
description: WList — paginated, sortable collections shown as a table on desktop and cards on mobile, with one field component per column.
---

# List

`WList` renders a paginated collection as a table on desktop and as cards on mobile. It owns pagination, selection, column settings (show, hide, reorder, resize) and ordering. You give it:

- `useQueryFn` and `queryParams` — a paginated query.
- `fields` — one component per column. Each has a `meta` export with its title, ordering field and CSS class, and renders one cell from `item`.
- Optionally an expansion component for a detail row and a menu component for row actions.

The [List with fields](/recipes/list-with-fields) recipe builds this step by step; the list below is its result.

<DocsDemo name="recipes/book-list/BookList" client-only />

## Layout variables

The sticky header, the checkbox column and full-width rows position themselves from the app's layout variables — `--header-height`, `--nav-bar-width`, `--actions-bar-width` and `--inner-margin` — so the app has to set them (see [App layout](/guide/getting-started#app-layout)). Inside a modal, the modal sets its own.

## API

<!-- @api WList -->

### WList

```ts
import WList from 'eco-vue-js/dist/components/List/WList.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | — | — |
| `fields` | `Fields` | **required** | — |
| `expansion` | `ExpansionComponent<Data, QueryParams>` | — | — |
| `useQueryFn` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | — |
| `useQueryFnExport` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | — |
| `queryParams` | `QueryParams` | **required** | — |
| `queryOptions` | `DefaultQueryOptions<PaginatedResponse<Data>>` | — | — |
| `bulkDisableMessage` | `string` | — | — |
| `selectionTitle` | `string` | **required** | — |
| `bulk` | `BulkComponent<QueryParams>[]` | — | — |
| `action` | `ActionComponent<QueryParams>[]` | — | — |
| `menu` | `MenuComponent<Data>[]` | — | — |
| `readonlyGetter` | `((item: Data) => boolean)` | — | — |
| `cardClass` | `string` | — | — |
| `cardWrapperClass` | `string` | — | — |
| `selectAllTextGetter` | `(isUnselect: boolean, count: number) => string` | **required** | — |
| `hasBorder` | `boolean` | — | — |
| `configKey` | `string` | **required** | — |
| `defaultConfigMap` | `FieldConfigMap<Fields>` | **required** | — |
| `defaultMode` | `ListMode` | `ListMode.TABLE` | — |
| `alignTop` | `boolean` | — | — |
| `disableMore` | `boolean` | — | — |
| `readonly` | `boolean` | — | — |
| `noOrdering` | `boolean` | — | — |
| `formFieldGetter` | `((data: Data, index: number) => string \| undefined)` | — | — |
| `uniformScope` | `UniformScope<Data[]>` | — | — |
| `groupBy` | `((a: Data, b: Data) => boolean)` | — | — |
| `cardColumns` | `CardColumns` | **required** | — |
| `cardAreas` | `CardAreas<Fields, CardColumns["length"]>` | **required** | — |
| `cardTo` | `((item: Data) => RouteLocationRaw \| undefined)` | — | — |
| `hasAction` | `boolean` | — | — |
| `noHeaderSettings` | `boolean` | — | — |
| `noRefetch` | `boolean` | — | — |
| `refetchInterval` | `number` | — | — |
| `apiMethodExport` | `((queryParams: QueryParams) => Promise<Data[]>)` | — | — |
| `exportFileName` | `string` | — | — |
| `disableExport` | `boolean` | — | — |
| `alwaysSelect` | `boolean` | — | — |
| `selection` | `Selection<number>` | — | — |
| `noHeaderUpdate` | `boolean` | — | — |
| `minHeight` | `boolean` | — | — |
| `toMarkdown` | `((data: Data, index: number) => string)` | — | — |
| `noMode` | `boolean` | — | — |
| `disableSelect` | `boolean` | — | — |
| `selectOnly` | `boolean` | — | — |
| `contentVisibility` | `boolean` | — | — |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:error` | `(ApiError<{}, ErrorResponse<{}>>)` | — |
| `click:action` | `(CardActionParams<Data>)` | — |
| `update:query-params` | `(QueryParams)` | — |
| `update:count` | `(number \| undefined)` | — |
| `update:selection` | `(Selection<number>)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `header` | `{ count: number \| undefined; }` | — |
| `selection` | — | — |
| `group` | `{ item: Data; previous: Data \| undefined; skeleton: boolean; }` | — |
| `empty` | — | — |

<!-- @api-end -->

<!-- @api WListCardField -->

### WListCardField

```ts
import WListCardField from 'eco-vue-js/dist/components/List/WListCardField.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | — | — |
| `skeleton` | `boolean` | — | — |
| `allowOpen` | `boolean` | — | — |
| `noPadding` | `boolean` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | — | — |
| `inner` | — | — |

<!-- @api-end -->
