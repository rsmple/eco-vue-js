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

## Other forms

- **`WSelectStringified`** is a `WSelect` whose model is one string — the values joined by `divider`, such as `"high,critical"` for a query param, or a JSON array with `divider="json"`.
- **`WSelectAsyncList`** shows the options of a paginated query as a list that is always open, in a scrolling box, with the picked ones checked — for picking from a long list inside a form or a modal. It emits `select` and `unselect` instead of a model; `selectOnly` and `unselectOnly` allow only one of them.

## API

<!-- @api WSelectSingle -->

### WSelectSingle

```ts
import WSelectSingle from 'eco-vue-js/dist/components/Select/WSelectSingle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| ClearValue \| null \| undefined` | **required** | Selected value. |
| `allowClear` | `AllowClear` | — | Adds a button that clears the value, emitting `clearValue`. |
| `clearValue` | `ClearValue` | — | Value emitted when cleared. Defaults to `null`; set it explicitly to emit `undefined` or `''`. |
| `createdData` | `Data` | — | Option to add to the loaded ones — for a selected value the query does not return, such as one created elsewhere. |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. |
| `queryParamsOptions` | `QueryParamsOptions` | — | Parameters for `useQueryFnOptions`. |
| `options` | `Data[]` | — | Static list of options, instead of loading them with `useQueryFnOptions`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | Tells whether an option matches the typed search, which is trimmed and lowercased. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `useFirstDefault` | `boolean` | — | Selects the first loaded option while nothing is selected, and emits `init-model`. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `filterOptions` | `((option: Data) => boolean)` | — | Hides options for which it returns `false`. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
| `required` | `boolean` | — | Adds an asterisk to the title. |
| `noMargin` | `boolean` | — | Drops the default bottom margin. |
| `allowCopy` | `boolean` | — | Adds a button that copies the value. |
| `leftError` | `boolean` | — | Aligns the error message to the left instead of the right. |
| `filterField` | `string` | — | Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. |
| `filterValue` | `unknown` | — | Value the filter button puts in the query. Defaults to `modelValue`. |
| `subgrid` | `boolean` | — | Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. |
| `seamless` | `boolean` | — | Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. |
| `topText` | `boolean` | — | Moves the counter and messages above the field instead of below it. |
| `allowDropFile` | `boolean` | — | Accepts files dropped onto the field. |
| `hideTitle` | `boolean` | — | Hides the title while keeping the rest of the layout. |
| `embedded` | `boolean` | — | For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(EmitType, Data \| undefined)` | The new value, with its option — `clearValue` when cleared. |
| `update:query-options-error` | `(string \| undefined)` | Error detail from a failed `useQueryFnOptions`, or `undefined` once it loads. |
| `init-model` | — | A default value was selected by `useQueryFnDefault` or `useFirstDefault`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | — | Content to the right of the field. |
| `prefix` | — | Replaces the selected chips. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `content` | — | Content at the top of the menu, above the options. |

<!-- @api-end -->

<!-- @api WSelect -->

### WSelect

```ts
import WSelect from 'eco-vue-js/dist/components/Select/WSelect.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model[] \| undefined` | **required** | Selected values. The component does not change it — update it from `select` and `unselect`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | Tells whether an option matches the typed search, which is trimmed and lowercased. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `useFirstDefault` | `boolean` | — | Selects the first loaded option while nothing is selected, and emits `init-model`. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `disableClear` | `boolean` | — | Hides the remove button on the selected chips. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `filterOptions` | `((option: Data) => boolean)` | — | Hides options for which it returns `false`. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `createdData` | `Data[]` | — | Options to add to the loaded ones — for selected values the query does not return, such as ones created elsewhere. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. |
| `queryParamsOptions` | `QueryParamsOptions` | — | Parameters for `useQueryFnOptions`. |
| `options` | `Data[]` | — | Static list of options, instead of loading them with `useQueryFnOptions`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
| `required` | `boolean` | — | Adds an asterisk to the title. |
| `noMargin` | `boolean` | — | Drops the default bottom margin. |
| `allowCopy` | `boolean` | — | Adds a button that copies the value. |
| `leftError` | `boolean` | — | Aligns the error message to the left instead of the right. |
| `filterField` | `string` | — | Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. |
| `filterValue` | `unknown` | — | Value the filter button puts in the query. Defaults to `modelValue`. |
| `subgrid` | `boolean` | — | Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. |
| `seamless` | `boolean` | — | Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. |
| `topText` | `boolean` | — | Moves the counter and messages above the field instead of below it. |
| `allowDropFile` | `boolean` | — | Accepts files dropped onto the field. |
| `hideTitle` | `boolean` | — | Hides the title while keeping the rest of the layout. |
| `embedded` | `boolean` | — | For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model, Data)` | An option was picked. Add it to `modelValue`. |
| `unselect` | `(Model, Data \| undefined)` | An option was removed, from its chip or the menu. Remove it from `modelValue`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |
| `update:query-options-error` | `(string \| undefined)` | Error detail from a failed `useQueryFnOptions`, or `undefined` once it loads. |
| `init-model` | — | A default value was selected by `useQueryFnDefault` or `useFirstDefault`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `right` | — | Content to the right of the field. |
| `prefix` | — | Replaces the selected chips. |
| `content` | — | Content at the top of the menu, above the options. |

<!-- @api-end -->

<!-- @api WSelectAsyncSingle -->

### WSelectAsyncSingle

```ts
import WSelectAsyncSingle from 'eco-vue-js/dist/components/Select/WSelectAsyncSingle.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| ClearValue \| null` | **required** | Selected value. |
| `allowClear` | `AllowClear` | — | Adds a button that clears the value, emitting `clearValue`. |
| `clearValue` | `ClearValue` | — | Value emitted when cleared. Defaults to `null`; set it explicitly to emit `undefined` or `''`. |
| `previewData` | `Data` | — | Selected option, shown in the field instead of loading it. |
| `createdData` | `Data` | — | Option to add to the loaded ones — for a selected value the query does not return, such as one created elsewhere. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `useQueryFnOptions` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query that loads the options, page by page as the menu scrolls. The search text is sent in `searchField`. |
| `queryParamsOptions` | `QueryParams` | **required** | Parameters for `useQueryFnOptions`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `useQueryFnPrefix` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | Paginated query that loads the selected options for the chips. Defaults to `useQueryFnOptions`. |
| `searchField` | `keyof QueryParams` | — | Query parameter that receives the search text. Defaults to `search`. |
| `valueQueryKey` | `string` | — | Query parameter that receives the selected values, comma-separated, when loading the chips. |
| `prefixText` | `string` | — | Word after the count shown instead of chips when more than `prefixMax` values are selected. Defaults to "items". |
| `prefixMax` | `number` | — | Most selected values shown as chips; above it, a count with a clear-all button is shown instead. |
| `reverse` | `boolean` | — | Shows the check mark on options that are not selected instead of those that are — for a select that picks what to exclude. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
| `required` | `boolean` | — | Adds an asterisk to the title. |
| `noMargin` | `boolean` | — | Drops the default bottom margin. |
| `allowCopy` | `boolean` | — | Adds a button that copies the value. |
| `leftError` | `boolean` | — | Aligns the error message to the left instead of the right. |
| `filterField` | `string` | — | Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. |
| `filterValue` | `unknown` | — | Value the filter button puts in the query. Defaults to `modelValue`. |
| `subgrid` | `boolean` | — | Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. |
| `seamless` | `boolean` | — | Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. |
| `topText` | `boolean` | — | Moves the counter and messages above the field instead of below it. |
| `allowDropFile` | `boolean` | — | Accepts files dropped onto the field. |
| `hideTitle` | `boolean` | — | Hides the title while keeping the rest of the layout. |
| `embedded` | `boolean` | — | For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(EmitType, Data \| undefined)` | The new value, with its option — `clearValue` when cleared. |
| `init-model` | — | A default value was selected by `useQueryFnDefault`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | `Record<string, never>` | Content to the right of the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `content` | — | Content at the top of the menu, above the options. |
| `prefix` | — | Replaces the selected chips. |

<!-- @api-end -->

<!-- @api WSelectAsync -->

### WSelectAsync

```ts
import WSelectAsync from 'eco-vue-js/dist/components/Select/WSelectAsync.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `useQueryFnOptions` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query that loads the options, page by page as the menu scrolls. The search text is sent in `searchField`. |
| `useQueryFnPrefix` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | — | Paginated query that loads the selected options for the chips. Defaults to `useQueryFnOptions`. |
| `queryParamsOptions` | `QueryParams` | **required** | Parameters for `useQueryFnOptions`. |
| `searchField` | `keyof QueryParams` | — | Query parameter that receives the search text. Defaults to `search`. |
| `previewData` | `Data[]` | — | Selected options, used for the chips instead of loading them. |
| `valueQueryKey` | `string` | `"id__in"` | Query parameter that receives the selected values, comma-separated, when loading the chips. |
| `prefixText` | `string` | — | Word after the count shown instead of chips when more than `prefixMax` values are selected. Defaults to "items". |
| `prefixMax` | `number` | `8` | Most selected values shown as chips; above it, a count with a clear-all button is shown instead. |
| `reverse` | `boolean` | — | Shows the check mark on options that are not selected instead of those that are — for a select that picks what to exclude. |
| `modelValue` | `Model[] \| undefined` | **required** | Selected values. The component does not change it — update it from `select` and `unselect`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `emptyStub` | `string` | `"No match"` | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `disableClear` | `boolean` | — | Hides the remove button on the selected chips. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `createdData` | `Data[]` | — | Options to add to the loaded ones — for selected values the query does not return, such as ones created elsewhere. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
| `required` | `boolean` | — | Adds an asterisk to the title. |
| `noMargin` | `boolean` | — | Drops the default bottom margin. |
| `allowCopy` | `boolean` | — | Adds a button that copies the value. |
| `leftError` | `boolean` | — | Aligns the error message to the left instead of the right. |
| `filterField` | `string` | — | Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. |
| `filterValue` | `unknown` | — | Value the filter button puts in the query. Defaults to `modelValue`. |
| `subgrid` | `boolean` | — | Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. |
| `seamless` | `boolean` | — | Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. |
| `topText` | `boolean` | — | Moves the counter and messages above the field instead of below it. |
| `allowDropFile` | `boolean` | — | Accepts files dropped onto the field. |
| `hideTitle` | `boolean` | — | Hides the title while keeping the rest of the layout. |
| `embedded` | `boolean` | — | For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model, Data)` | An option was picked. Add it to `modelValue`. |
| `unselect` | `(Model, Data \| undefined)` | An option was removed, from its chip or the menu. Remove it from `modelValue`. |
| `update:model-value` | `(Model[])` | Emits `[]` from the clear-all button shown with the count, when more than `prefixMax` values are selected. |
| `init-model` | — | A default value was selected by `useQueryFnDefault`. |
| `focus` | `(FocusEvent \| undefined)` | The field was focused. |
| `blur` | `(FocusEvent)` | The field lost focus. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | `Record<string, never>` | Content to the right of the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Renders an option, in the menu and in the selected chips — `model` is `true` in a chip. Replaces `optionComponent`. |
| `content` | — | Content at the top of the menu, above the options. |
| `prefix` | `{ modelValue: Model[]; }` | Replaces the selected chips. |

<!-- @api-end -->

<!-- @api WSelectStringified -->

### WSelectStringified

```ts
import WSelectStringified from 'eco-vue-js/dist/components/Select/WSelectStringified.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Model \| null \| undefined` | **required** | Picked values in one string, joined by `divider`. |
| `divider` | `string` | **required** | Separator between the values, e.g. `,`, or `json` for a JSON array of strings. |
| `useQueryFnOptions` | `UseQueryDefault<Data[], unknown> \| UseQueryDefault<Data[], QueryParamsOptions>` | — | Query that loads the options. Takes `queryParamsOptions` when the query has parameters. Use either this or `options`. |
| `queryParamsOptions` | `QueryParamsOptions` | — | Parameters for `useQueryFnOptions`. |
| `options` | `Data[]` | — | Static list of options, instead of loading them with `useQueryFnOptions`. |
| `valueGetter` | `(value: Data) => Model` | **required** | Gets the value stored in the model from an option. |
| `searchFn` | `(option: Data, search: string) => boolean` | **required** | Tells whether an option matches the typed search, which is trimmed and lowercased. |
| `useQueryFnDefault` | `UseQueryDefault<Data, undefined>` | — | Query that loads a default option. When it resolves while nothing is selected, the option is selected and `init-model` is emitted. |
| `useFirstDefault` | `boolean` | — | Selects the first loaded option while nothing is selected, and emits `init-model`. |
| `emptyStub` | `string` | — | Shown in the menu instead of "Nothing to show" when there are no options and no search. |
| `disableClear` | `boolean` | — | Hides the remove button on the selected chips. |
| `hidePrefix` | `boolean` | — | Hides the selected chips while the menu is open, leaving room to type. |
| `createOption` | `((search: string) => Data \| Promise<Data \| undefined> \| undefined)` | — | Adds a "New:" option for the typed search. Return the created option to select it, or `undefined` to cancel. |
| `filterOptions` | `((option: Data) => boolean)` | — | Hides options for which it returns `false`. |
| `hideOptionIcon` | `boolean` | — | Hides the check mark next to selected options in the menu. |
| `createdData` | `Data[]` | — | Options to add to the loaded ones — for selected values the query does not return, such as ones created elsewhere. |
| `searchModel` | `boolean` | — | Commits the typed text when the menu closes — selects the option matching it exactly, or creates one with `createOption`. In a single select, the selected value is also put into the search text on focus, so it can be edited. For string values. |
| `lazy` | `boolean` | — | Waits until the menu is first opened before loading the options. |
| `placeholderEmpty` | `string` | — | Placeholder while nothing is selected and the field is not focused. Defaults to `placeholder`. |
| `optionComponent` | `OptionComponent` | — | Component that renders an option, in the menu and in the selected chips. Receives `option`, `selected`, `model` and `search`. The `option` slot replaces it. |
| `optionComponentProps` | `(OptionComponent extends Component<infer Props> ? Partial<Omit<Props, keyof SelectOptionProps<Option>>> : never)` | — | Extra props passed to every `optionComponent`. |
| `horizontalAlign` | `HorizontalAlign` | — | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
| `dropdownClass` | `string` | — | Classes for the menu's content box. Defaults to `w-max`. |

::: details Inherited from `src/components/FieldWrapper/types.ts` (21)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the field; the `title` slot replaces it. |
| `titleIcon` | `SVGComponent` | — | Icon before the title text. |
| `description` | `string` | — | Secondary text under the field. |
| `errorMessage` | `string` | — | Validation message under the field, which also colors the changes marker. |
| `tooltipText` | `string` | — | Tooltip on hover over the whole field. Not shown while readonly or loading as a skeleton. |
| `mono` | `boolean` | — | Monospace font for the value. |
| `hasChanges` | `boolean` | — | Shows a dot in the field's corner, marking an unsaved change. |
| `skeleton` | `boolean` | — | Renders skeleton placeholders for the title, field and description. When unset, inherits the skeleton state provided by a parent. |
| `disabled` | `boolean` | — | Blocks input and dims the field. When unset, inherits the disabled state provided by a parent. |
| `required` | `boolean` | — | Adds an asterisk to the title. |
| `noMargin` | `boolean` | — | Drops the default bottom margin. |
| `allowCopy` | `boolean` | — | Adds a button that copies the value. |
| `leftError` | `boolean` | — | Aligns the error message to the left instead of the right. |
| `filterField` | `string` | — | Route query key for a filter button next to the title — clicking it toggles `filterField=<value>` in the URL. |
| `filterValue` | `unknown` | — | Value the filter button puts in the query. Defaults to `modelValue`. |
| `subgrid` | `boolean` | — | Lays the field out on the parent grid's columns, with the title in the first column, so titles and fields line up across rows. |
| `seamless` | `boolean` | — | Hides the title and drops the field's own chrome until it is hovered or focused, for inline editing. |
| `topText` | `boolean` | — | Moves the counter and messages above the field instead of below it. |
| `allowDropFile` | `boolean` | — | Accepts files dropped onto the field. |
| `hideTitle` | `boolean` | — | Hides the title while keeping the rest of the layout. |
| `embedded` | `boolean` | — | For a field placed inside another component, such as a dropdown: no title, no margin, and horizontal padding. |

:::

::: details Inherited from `src/components/Input/types.ts` (34)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `"text"` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(Model)` | The picked values, joined into one string. |
| `update:query-options-error` | `(string \| undefined)` | Error message of the options query, or `undefined` once it loads. |
| `init-model` | — | The options loaded. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | — | Content to the right of the field. |
| `option` | `PartialNot<SelectOptionProps<Data>>` | Content of an option, in the menu and in the chips. |
| `content` | — | Content at the top of the menu. |

<!-- @api-end -->

<!-- @api WSelectAsyncList -->

### WSelectAsyncList

```ts
import WSelectAsyncList from 'eco-vue-js/dist/components/Select/WSelectAsyncList.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Label above the list. |
| `emptyStub` | `string` | — | Text shown when the query returns no options. |
| `modelValue` | `Model[]` | **required** | Picked values. |
| `useQueryFn` | `UseQueryDefault<PaginatedResponse<Data>, QueryParams>` | **required** | Paginated query of the options, loaded page by page as the list scrolls. |
| `queryParams` | `QueryParams` | **required** | Params of the query, such as a search. |
| `skeleton` | `boolean` | — | Shows placeholders instead of the list. When unset, inherits the skeleton state provided by a parent. |
| `excludeParams` | `(keyof QueryParams)[]` | — | Params whose change refetches the loaded pages instead of starting from the first one. |
| `selectOnly` | `boolean` | — | Only allows picking options, not unpicking them. |
| `unselectOnly` | `boolean` | — | Only allows unpicking options, not picking them. |
| `hideOptionIcon` | `boolean` | — | Hides the check icon of the options. |
| `valueGetter` | `((data: Data) => Model)` | `(data as unknown as {     id: Model; }).id` | Value of an option. Defaults to its `id`. |
| `queryOptions` | `Partial<DefaultQueryOptions<PaginatedResponse<Data>> \| undefined>` | — | Options for every page query. |
| `disabled` | `boolean` | — | Stops picking. When unset, inherits the disabled state provided by a parent. |
| `readonly` | `boolean` | — | Stops picking. When unset, inherits the readonly state provided by a parent. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `select` | `(Model)` | An option was picked. |
| `unselect` | `(Model)` | An option was unpicked. |
| `update:count` | `(number)` | Total number of options, from the query's `count`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `default` | `PartialNot<SelectOptionProps<Data>>` | Content of an option, with `skeleton` while its page loads. |

<!-- @api-end -->
