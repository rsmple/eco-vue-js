---
group: Controls
order: 2
description: WSelectSingle, WSelect and their async variants — searchable selects over a static list or a paginated query, with a custom option template.
---

# Select

Selects pick values out of a list of objects. The model holds only the values — ids, codes — and the select finds the objects behind them to display.

| Component | Model | Options come from |
| --- | --- | --- |
| `WSelectSingle` | one value or `null` | `options` array, or a `useQueryFnOptions` query returning an array |
| `WSelect` | array of values | same as above |
| `WSelectAsyncSingle` | one value or `null` | a paginated query, searched and paged on the server |
| `WSelectAsync` | array of values | same as above |

Every select needs:

- `valueGetter` — picks the model value out of an option.
- An `option` slot or an `optionComponent` to render an option. There is no default label; the slot receives `option`, `selected` and `model` (`true` when rendering the chosen value in the field rather than in the dropdown).
- `searchFn` for the static selects — the async ones send the search text to the query instead.

## Single

<!-- @example Select/Single -->

<DocsDemo name="Select/Single" />

```vue
<template>
  <WSelectSingle
    v-model="country"
    :options="countries"
    :value-getter="item => item.code"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Country"
    placeholder="Pick a country"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  >
    <template #option="{option}">
      {{ option?.name }}
    </template>
  </WSelectSingle>

  <p class="text-sm text-gray-500">
    Model: {{ country ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'

const countries = [
  {id: 1, code: 'de', name: 'Germany'},
  {id: 2, code: 'fr', name: 'France'},
  {id: 3, code: 'it', name: 'Italy'},
  {id: 4, code: 'es', name: 'Spain'},
]

const country = ref<string | null>('fr')
</script>
```

<!-- @example-end -->

With `allowClear` the value can be cleared. `clearValue` sets what clearing emits — `null`, `undefined` or `''` — and passing it explicitly also narrows the emitted type to match your model.

## Multiple

`WSelect` has no `v-model`: it emits `select` and `unselect` with the value, and leaves adding and removing to the parent. That way the parent can save each change, and show a spinner on the option until it's done with `loading`.

<!-- @example Select/Multiple -->

<DocsDemo name="Select/Multiple" />

```vue
<template>
  <WSelect
    :model-value="tags"
    :options="options"
    :value-getter="item => item.id"
    :search-fn="(item, search) => item.name.toLowerCase().includes(search.toLowerCase())"
    title="Tags"
    placeholder="Add a tag"
    class="max-w-md"
    @select="tags = [...tags, $event]"
    @unselect="tags = tags.filter(item => item !== $event)"
  >
    <template #option="{option}">
      {{ option?.name }}
    </template>
  </WSelect>

  <p class="text-sm text-gray-500">
    Model: {{ tags }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'

const options = [
  {id: 1, name: 'urgent'},
  {id: 2, name: 'backend'},
  {id: 3, name: 'frontend'},
  {id: 4, name: 'design'},
  {id: 5, name: 'docs'},
]

const tags = ref<number[]>([2, 3])
</script>
```

<!-- @example-end -->

## Async

`WSelectAsyncSingle` and `WSelectAsync` take `useQueryFnOptions` — a paginated query made with the kit's query helpers — and `queryParamsOptions`. The search text goes into the query params as `search` (`searchField` renames it), and more pages load as the dropdown scrolls.

To show the chosen value before the user opens the dropdown, the select requests it by id: the same query with `id__in` set to the model values (`valueQueryKey` renames it). The endpoint has to support that filter.

<!-- @example Select/Async -->

<DocsDemo name="Select/Async" />

```vue
<template>
  <WSelectAsyncSingle
    v-model="bookId"
    :use-query-fn-options="useQueryBooks"
    :query-params-options="{}"
    :value-getter="item => item.id"
    title="Book"
    placeholder="Search by title or author"
    allow-clear
    :clear-value="null"
    class="max-w-md"
  >
    <template #option="{option}">
      <span v-if="option">
        {{ option.title }} <span class="text-description">— {{ option.author }}</span>
      </span>
    </template>
  </WSelectAsyncSingle>

  <p class="text-sm text-gray-500">
    Model: {{ bookId ?? 'null' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'

// Any paginated query made with the kit's query helpers — here the stand-in API from the list recipe.
import {useQueryBooks} from '../../../../../docs/examples/recipes/book-list/api/Book'

const bookId = ref<number | null>(3)
</script>
```

<!-- @example-end -->

## API

<!-- @api WSelectSingle -->

### WSelectSingle

```ts
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| ClearValue \| null \| undefined` | **required** | — |
| `allowClear` | `AllowClear` | — | — |
| `clearValue` | `ClearValue` | — | — |
| `searchModel` | `boolean` | — | — |
| `createdData` | `Data` | — | — |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | — |
| `queryParamsOptions` | `QueryParamsOptions` | — | — |
| `options` | `Data[]` | — | — |
| `valueGetter` | `(value: Data) => Model` | **required** | — |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | — |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | — |
| `useFirstDefault` | `boolean` | — | — |
| `emptyStub` | `string` | — | — |
| `hidePrefix` | `boolean` | — | — |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | — |
| `filterOptions` | `((option: Data) => boolean)` | — | — |
| `hideOptionIcon` | `boolean` | — | — |
| `selectOnClose` | `boolean` | — | — |
| `lazy` | `boolean` | — | — |
| `placeholderEmpty` | `string` | — | — |
| `optionComponent` | `OptionComponent` | — | — |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | — |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | — |
| `dropdownClass` | `string` | — | — |

::: details Inherited from `src/components/FieldWrapper/types.ts` (23)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | — |
| `titleIcon` | `SVGComponent` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | — |
| `tooltipText` | `string` | — | — |
| `mono` | `boolean` | — | — |
| `hasChanges` | `boolean` | — | — |
| `skeleton` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `required` | `boolean` | — | — |
| `mandatory` | `boolean` | — | — |
| `noMargin` | `boolean` | — | — |
| `allowCopy` | `boolean` | — | — |
| `leftError` | `boolean` | — | — |
| `filterField` | `string` | — | — |
| `filterValue` | `unknown` | — | — |
| `subgrid` | `boolean` | — | — |
| `seamless` | `boolean` | — | — |
| `savedText` | `string` | — | — |
| `topText` | `boolean` | — | — |
| `allowDropFile` | `boolean` | — | — |
| `hideTitle` | `boolean` | — | — |
| `embedded` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | — |
| `readonly` | `boolean` | — | — |
| `type` | `"text"` | — | — |
| `textarea` | `boolean` | — | — |
| `resize` | `boolean` | — | — |
| `placeholder` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `size` | `number` | — | — |
| `step` | `number` | — | — |
| `min` | `number` | — | — |
| `max` | `number` | — | — |
| `name` | `string` | — | — |
| `autocomplete` | `string` | — | — |
| `autofocus` | `number \| boolean` | — | — |
| `disabledActions` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `spellcheck` | `boolean` | — | — |
| `customBackspaceHandle` | `boolean` | — | — |
| `textSecure` | `boolean` | — | — |
| `placeholderSecure` | `boolean` | — | — |
| `allowPaste` | `boolean` | — | — |
| `hideInput` | `boolean` | — | — |
| `noWrap` | `boolean` | — | — |
| `textTransparent` | `boolean` | — | — |
| `textParts` | `TextPart[]` | — | — |
| `rich` | `boolean` | — | — |
| `toolbarActions` | `ToolbarAction[]` | — | — |
| `borderClass` | `string` | — | — |
| `explicit` | `boolean` | — | — |
| `mobileTitle` | `string` | — | — |
| `persist` | `boolean` | — | — |
| `closeOnClear` | `boolean` | — | — |
| `static` | `boolean` | — | — |
| `hideToggle` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Dropdown/types.ts` (4)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | — | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `innerClass` | `string` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(EmitType, Data \| undefined)` | — |
| `update:query-options-error` | `(string \| undefined)` | — |
| `init-model` | — | — |
| `focus` | `(FocusEvent \| undefined)` | — |
| `blur` | `(FocusEvent)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | `any` | — |
| `subtitle` | `any` | — |
| `right` | `any` | — |
| `prefix` | `any` | — |
| `option` | `PartialNot<SelectOptionProps<Data>>` | — |
| `content` | `any` | — |

<!-- @api-end -->

<!-- @api WSelect -->

### WSelect

```ts
import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model[] \| undefined` | **required** | — |
| `valueGetter` | `(value: Data) => Model` | **required** | — |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | — |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | — |
| `useFirstDefault` | `boolean` | — | — |
| `emptyStub` | `string` | — | — |
| `disableClear` | `boolean` | — | — |
| `hidePrefix` | `boolean` | — | — |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | — |
| `filterOptions` | `((option: Data) => boolean)` | — | — |
| `hideOptionIcon` | `boolean` | — | — |
| `createdData` | `Data[]` | — | — |
| `selectOnClose` | `boolean` | — | — |
| `lazy` | `boolean` | — | — |
| `placeholderEmpty` | `string` | — | — |
| `optionComponent` | `OptionComponent` | — | — |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | — |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | — |
| `queryParamsOptions` | `QueryParamsOptions` | — | — |
| `options` | `Data[]` | — | — |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | — |
| `dropdownClass` | `string` | — | — |

::: details Inherited from `src/components/FieldWrapper/types.ts` (23)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | — |
| `titleIcon` | `SVGComponent` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | — |
| `tooltipText` | `string` | — | — |
| `mono` | `boolean` | — | — |
| `hasChanges` | `boolean` | — | — |
| `skeleton` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `required` | `boolean` | — | — |
| `mandatory` | `boolean` | — | — |
| `noMargin` | `boolean` | — | — |
| `allowCopy` | `boolean` | — | — |
| `leftError` | `boolean` | — | — |
| `filterField` | `string` | — | — |
| `filterValue` | `unknown` | — | — |
| `subgrid` | `boolean` | — | — |
| `seamless` | `boolean` | — | — |
| `savedText` | `string` | — | — |
| `topText` | `boolean` | — | — |
| `allowDropFile` | `boolean` | — | — |
| `hideTitle` | `boolean` | — | — |
| `embedded` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | — |
| `readonly` | `boolean` | — | — |
| `type` | `"text"` | — | — |
| `textarea` | `boolean` | — | — |
| `resize` | `boolean` | — | — |
| `placeholder` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `size` | `number` | — | — |
| `step` | `number` | — | — |
| `min` | `number` | — | — |
| `max` | `number` | — | — |
| `name` | `string` | — | — |
| `autocomplete` | `string` | — | — |
| `autofocus` | `number \| boolean` | — | — |
| `disabledActions` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `spellcheck` | `boolean` | — | — |
| `customBackspaceHandle` | `boolean` | — | — |
| `textSecure` | `boolean` | — | — |
| `placeholderSecure` | `boolean` | — | — |
| `allowPaste` | `boolean` | — | — |
| `hideInput` | `boolean` | — | — |
| `noWrap` | `boolean` | — | — |
| `textTransparent` | `boolean` | — | — |
| `textParts` | `TextPart[]` | — | — |
| `rich` | `boolean` | — | — |
| `toolbarActions` | `ToolbarAction[]` | — | — |
| `borderClass` | `string` | — | — |
| `explicit` | `boolean` | — | — |
| `mobileTitle` | `string` | — | — |
| `persist` | `boolean` | — | — |
| `closeOnClear` | `boolean` | — | — |
| `static` | `boolean` | — | — |
| `hideToggle` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Dropdown/types.ts` (4)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | — | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `innerClass` | `string` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model, Data)` | — |
| `unselect` | `(Model, Data \| undefined)` | — |
| `focus` | `(FocusEvent \| undefined)` | — |
| `blur` | `(FocusEvent)` | — |
| `update:query-options-error` | `(string \| undefined)` | — |
| `init-model` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | `any` | — |
| `subtitle` | `any` | — |
| `option` | `PartialNot<SelectOptionProps<Data>>` | — |
| `right` | `any` | — |
| `prefix` | `any` | — |
| `content` | `any` | — |

<!-- @api-end -->

<!-- @api WSelectAsyncSingle -->

### WSelectAsyncSingle

```ts
import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| ClearValue \| null` | **required** | — |
| `allowClear` | `AllowClear` | — | — |
| `clearValue` | `ClearValue` | — | — |
| `searchModel` | `boolean` | — | — |
| `previewData` | `Data` | — | — |
| `createdData` | `Data` | — | — |
| `optionComponent` | `OptionComponent` | — | — |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | — |
| `useQueryFnOptions` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | — |
| `queryParamsOptions` | `QueryParams` | **required** | — |
| `valueGetter` | `(value: Data) => Model` | **required** | — |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | — |
| `useFirstDefault` | `boolean` | — | — |
| `emptyStub` | `string` | — | — |
| `hidePrefix` | `boolean` | — | — |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | — |
| `hideOptionIcon` | `boolean` | — | — |
| `selectOnClose` | `boolean` | — | — |
| `lazy` | `boolean` | — | — |
| `placeholderEmpty` | `string` | — | — |
| `useQueryFnPrefix` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | — |
| `searchField` | `keyof QueryParams` | — | — |
| `valueQueryKey` | `string` | — | — |
| `prefixText` | `string` | — | — |
| `prefixMax` | `number` | — | — |
| `reverse` | `boolean` | — | — |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | — |
| `dropdownClass` | `string` | — | — |

::: details Inherited from `src/components/FieldWrapper/types.ts` (23)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | — |
| `titleIcon` | `SVGComponent` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | — |
| `tooltipText` | `string` | — | — |
| `mono` | `boolean` | — | — |
| `hasChanges` | `boolean` | — | — |
| `skeleton` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `required` | `boolean` | — | — |
| `mandatory` | `boolean` | — | — |
| `noMargin` | `boolean` | — | — |
| `allowCopy` | `boolean` | — | — |
| `leftError` | `boolean` | — | — |
| `filterField` | `string` | — | — |
| `filterValue` | `unknown` | — | — |
| `subgrid` | `boolean` | — | — |
| `seamless` | `boolean` | — | — |
| `savedText` | `string` | — | — |
| `topText` | `boolean` | — | — |
| `allowDropFile` | `boolean` | — | — |
| `hideTitle` | `boolean` | — | — |
| `embedded` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | — |
| `readonly` | `boolean` | — | — |
| `type` | `"text"` | — | — |
| `textarea` | `boolean` | — | — |
| `resize` | `boolean` | — | — |
| `placeholder` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `size` | `number` | — | — |
| `step` | `number` | — | — |
| `min` | `number` | — | — |
| `max` | `number` | — | — |
| `name` | `string` | — | — |
| `autocomplete` | `string` | — | — |
| `autofocus` | `number \| boolean` | — | — |
| `disabledActions` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `spellcheck` | `boolean` | — | — |
| `customBackspaceHandle` | `boolean` | — | — |
| `textSecure` | `boolean` | — | — |
| `placeholderSecure` | `boolean` | — | — |
| `allowPaste` | `boolean` | — | — |
| `hideInput` | `boolean` | — | — |
| `noWrap` | `boolean` | — | — |
| `textTransparent` | `boolean` | — | — |
| `textParts` | `TextPart[]` | — | — |
| `rich` | `boolean` | — | — |
| `toolbarActions` | `ToolbarAction[]` | — | — |
| `borderClass` | `string` | — | — |
| `explicit` | `boolean` | — | — |
| `mobileTitle` | `string` | — | — |
| `persist` | `boolean` | — | — |
| `closeOnClear` | `boolean` | — | — |
| `static` | `boolean` | — | — |
| `hideToggle` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Dropdown/types.ts` (4)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | — | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `innerClass` | `string` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(EmitType, Data \| undefined)` | — |
| `init-model` | — | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | `any` | — |
| `subtitle` | `any` | — |
| `right` | `Record<string, never>` | — |
| `option` | `PartialNot<SelectOptionProps<Data>>` | — |
| `content` | `any` | — |
| `prefix` | `any` | — |

<!-- @api-end -->

<!-- @api WSelectAsync -->

### WSelectAsync

```ts
import WSelectAsync from 'eco-vue-js/dist/components/Select/WSelectAsync.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `useQueryFnOptions` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | — |
| `useQueryFnPrefix` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | — |
| `queryParamsOptions` | `QueryParams` | **required** | — |
| `searchField` | `keyof QueryParams` | — | — |
| `previewData` | `Data[]` | — | — |
| `valueQueryKey` | `string` | `"id__in"` | — |
| `prefixText` | `string` | — | — |
| `prefixMax` | `number` | — | — |
| `reverse` | `boolean` | — | — |
| `modelValue` | `Model[] \| undefined` | **required** | — |
| `valueGetter` | `(value: Data) => Model` | **required** | — |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | — |
| `useFirstDefault` | `boolean` | — | — |
| `emptyStub` | `string` | `"No match"` | — |
| `disableClear` | `boolean` | — | — |
| `hidePrefix` | `boolean` | — | — |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | — |
| `hideOptionIcon` | `boolean` | — | — |
| `createdData` | `Data[]` | — | — |
| `selectOnClose` | `boolean` | — | — |
| `lazy` | `boolean` | — | — |
| `placeholderEmpty` | `string` | — | — |
| `optionComponent` | `OptionComponent` | — | — |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | — |
| `parentElement` | `Pick<Element, "getBoundingClientRect">` | — | — |
| `dropdownClass` | `string` | — | — |

::: details Inherited from `src/components/FieldWrapper/types.ts` (23)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | — |
| `titleIcon` | `SVGComponent` | — | — |
| `description` | `string` | — | — |
| `errorMessage` | `string` | — | — |
| `tooltipText` | `string` | — | — |
| `mono` | `boolean` | — | — |
| `hasChanges` | `boolean` | — | — |
| `skeleton` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `required` | `boolean` | — | — |
| `mandatory` | `boolean` | — | — |
| `noMargin` | `boolean` | — | — |
| `allowCopy` | `boolean` | — | — |
| `leftError` | `boolean` | — | — |
| `filterField` | `string` | — | — |
| `filterValue` | `unknown` | — | — |
| `subgrid` | `boolean` | — | — |
| `seamless` | `boolean` | — | — |
| `savedText` | `string` | — | — |
| `topText` | `boolean` | — | — |
| `allowDropFile` | `boolean` | — | — |
| `hideTitle` | `boolean` | — | — |
| `embedded` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | — |
| `readonly` | `boolean` | — | — |
| `type` | `"text"` | — | — |
| `textarea` | `boolean` | — | — |
| `resize` | `boolean` | — | — |
| `placeholder` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `size` | `number` | — | — |
| `step` | `number` | — | — |
| `min` | `number` | — | — |
| `max` | `number` | — | — |
| `name` | `string` | — | — |
| `autocomplete` | `string` | — | — |
| `autofocus` | `number \| boolean` | — | — |
| `disabledActions` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `spellcheck` | `boolean` | — | — |
| `customBackspaceHandle` | `boolean` | — | — |
| `textSecure` | `boolean` | — | — |
| `placeholderSecure` | `boolean` | — | — |
| `allowPaste` | `boolean` | — | — |
| `hideInput` | `boolean` | — | — |
| `noWrap` | `boolean` | — | — |
| `textTransparent` | `boolean` | — | — |
| `textParts` | `TextPart[]` | — | — |
| `rich` | `boolean` | — | — |
| `toolbarActions` | `ToolbarAction[]` | — | — |
| `borderClass` | `string` | — | — |
| `explicit` | `boolean` | — | — |
| `mobileTitle` | `string` | — | — |
| `persist` | `boolean` | — | — |
| `closeOnClear` | `boolean` | — | — |
| `static` | `boolean` | — | — |
| `hideToggle` | `boolean` | — | — |

:::

::: details Inherited from `src/components/Dropdown/types.ts` (4)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | — | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `innerClass` | `string` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model, Data)` | — |
| `unselect` | `(Model, Data \| undefined)` | — |
| `update:model-value` | `(Model[])` | — |
| `init-model` | — | — |
| `focus` | `(FocusEvent \| undefined)` | — |
| `blur` | `(FocusEvent)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | `any` | — |
| `subtitle` | `any` | — |
| `right` | `Record<string, never>` | — |
| `option` | `PartialNot<SelectOptionProps<Data>>` | — |
| `content` | `any` | — |
| `prefix` | `{ modelValue: Model[]; }` | — |

<!-- @api-end -->
