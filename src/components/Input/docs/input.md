---
group: Controls
order: 1
description: WInput — text, number, password and multiline inputs with titles, clear button, states and validation, plus WInputAsync and WInputDate.
---

# Input

`WInput` is a text field bound with `v-model`. It renders its own title, description and error message, so a form row is a single component. The other inputs in this folder wrap it: `WInputAsync` adds validation, `WInputSuggest` a dropdown, `WInputOptions` a list of suggestions and `WInputDate` a date picker.

## Basic usage

`type="number"` makes the model a `number`; everything else is a `string`. `textarea` switches to a multiline field that grows with its content, `resize` lets the user drag it taller. `allowClear` adds a clear button, `icon` an icon at the start.

<!-- @example Input/Basic -->

<DocsDemo name="Input/Basic" />

```vue
<template>
  <div class="grid max-w-md gap-2">
    <WInput
      v-model="name"
      title="Name"
      placeholder="Jane Austen"
      allow-clear
    />

    <WInput
      v-model="search"
      placeholder="Search"
      :icon="IconSearch"
      allow-clear
    />

    <WInput
      v-model="year"
      type="number"
      title="Year"
      :min="0"
      :max="2100"
    />

    <WInput
      v-model="notes"
      title="Notes"
      textarea
      resize
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'

import IconSearch from 'eco-vue-js/dist/assets/icons/IconSearch'

const name = ref<string>()
const search = ref<string>()
const year = ref<number>()
const notes = ref<string>()
</script>
```

<!-- @example-end -->

## States

- `title`, `description` and `errorMessage` render around the field. `required` adds an asterisk to the title.
- `readonly`, `disabled` and `skeleton` fall back to the state provided by a parent, the same way as for buttons — a readonly form makes every input inside it readonly.

<!-- @example Input/States -->

<DocsDemo name="Input/States" />

```vue
<template>
  <div class="grid max-w-md gap-2">
    <WInput
      model-value="Moby-Dick"
      title="Required"
      description="Shown under the title."
      required
    />

    <WInput
      model-value="1851"
      title="With an error"
      error-message="Must be after 1900"
    />

    <WInput
      model-value="Read only"
      title="Readonly"
      readonly
    />

    <WInput
      model-value="Disabled"
      title="Disabled"
      disabled
    />

    <WInput
      title="Skeleton"
      skeleton
    />
  </div>
</template>

<script lang="ts" setup>
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
</script>
```

<!-- @example-end -->

## Validation

`WInputAsync` edits a local copy and saves it on Enter or blur (or after `debounce`). `validate` — one function or a list — returns an error message or `undefined`; an invalid value shows the error and is not saved, so the parent only ever receives valid values.

<!-- @example Input/Validate -->

<DocsDemo name="Input/Validate" />

```vue
<template>
  <WInputAsync
    v-model="email"
    title="Email"
    placeholder="name@example.com"
    :validate="[required, isEmail]"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Saved value: {{ email || '—' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInputAsync from 'eco-vue-js/dist/components/Input/WInputAsync.vue'

const email = ref<string>()

const required: ValidateFn = value => value ? undefined : 'Required'
const isEmail: ValidateFn = value => typeof value === 'string' && value.includes('@') ? undefined : 'Not an email'
</script>
```

<!-- @example-end -->

## Suggestions

`WInputOptions` is a free-text input with a list of suggestions under it. Arrow keys move through the list, Enter or a click puts the option's `valueGetter` value into the input. The list is not filtered for you — pass the options that match the current text.

`WInputSuggest` is the same input with an empty menu: put anything into its `content` slot, and call the slot's `blur` to close it.

<!-- @example Input/Options -->

<DocsDemo name="Input/Options" />

```vue
<template>
  <WInputOptions
    v-model="country"
    title="Country"
    placeholder="Start typing"
    :options="filtered"
    :value-getter="option => option.name"
    empty-stub="No such country"
    allow-clear
    class="max-w-md"
  >
    <template #option="{option}">
      <div class="w-option flex items-center">
        {{ option.flag }} {{ option.name }}
      </div>
    </template>
  </WInputOptions>

  <p class="text-sm text-description">
    Model: {{ country || '—' }}
  </p>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'

import WInputOptions from 'eco-vue-js/dist/components/Input/WInputOptions.vue'

const countries = [
  {id: 1, name: 'Austria', flag: '🇦🇹'},
  {id: 2, name: 'Belgium', flag: '🇧🇪'},
  {id: 3, name: 'Denmark', flag: '🇩🇰'},
  {id: 4, name: 'France', flag: '🇫🇷'},
  {id: 5, name: 'Germany', flag: '🇩🇪'},
  {id: 6, name: 'Norway', flag: '🇳🇴'},
]

const country = ref<string | null>()

const filtered = computed(() => countries.filter(item => item.name.toLowerCase().includes(country.value?.toLowerCase() ?? '')))
</script>
```

<!-- @example-end -->

## Date

`WInputDate` binds a `Date` and opens a calendar. The user can also type a date; `minDate` and `maxDate` limit both.

<!-- @example Input/Date -->

<DocsDemo name="Input/Date" />

```vue
<template>
  <WInputDate
    v-model="date"
    title="Due date"
    :min-date="new Date()"
    class="max-w-md"
  />

  <p class="text-sm text-description">
    Model: {{ date?.toDateString() ?? '—' }}
  </p>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

import WInputDate from 'eco-vue-js/dist/components/Input/WInputDate.vue'

const date = ref<Date>()
</script>
```

<!-- @example-end -->

## Toolbar

A textarea with `rich` gets a toolbar of formatting buttons; `toolbarActions` adds your own. Each action wraps the selected text: `value` is a `WrapSelection`, such as a start and end marker to toggle, and a list of them makes a group that opens on hover. `WInputToolbarButton` is the button itself, for the `toolbar` slot of `WInputSuggest` when a button needs more than a formatting — call the slot's `wrapSelection` from its `click`.

## API

<!-- @api WInput -->

### WInput

```ts
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `(Type extends "number" ? number : string) \| null` | — | Field value — a `number` when `type` is `number`, otherwise a `string`. |
| `type` | `Type` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | `10` | Native `size` attribute, which sets the input's minimum width in characters. |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | `"off"` | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `unclickable` | `boolean \| null` | `null` | Blocks typing and turns a click into a `focus` event, for fields that open a menu instead of taking text. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowClear` | `boolean` | — | Adds a button that clears the value. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `async` | `boolean` | — | Keeps edits local and emits them only when saved — on Enter or blur — instead of on every keystroke. |
| `debounce` | `number` | — | With `async`, also saves after this many ms without typing, showing a progress bar under the text. |
| `hideDebounce` | `boolean` | — | Hides the `debounce` progress bar. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |

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

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(((Type extends "number" ? number : string) & {}) \| undefined)` | The new value — on every change, or only when saved with `async`. |
| `keypress:enter` | `(KeyboardEvent)` | Enter without modifiers. Not emitted by an `async` single-line input, where Enter saves. |
| `keypress:up` | `(KeyboardEvent)` | Arrow Up without modifiers. |
| `keypress:down` | `(KeyboardEvent)` | Arrow Down without modifiers. |
| `keypress:delete` | `(KeyboardEvent)` | Backspace or Delete without modifiers. |
| `click:clear` | — | The clear button was clicked. |
| `focus` | `(FocusEvent \| undefined)` | The input got focus. With `unclickable`, emitted on click with no event. |
| `blur` | `(FocusEvent)` | The input lost focus. |
| `click` | `(MouseEvent)` | Click on the input, or on the button that reveals a `textSecure` value. |
| `mousedown` | `(MouseEvent)` | Mouse down on the input. Stopped from reaching the field. |
| `select:input` | `(Event)` | Native `select` event of the input — the text selection changed. |
| `paste` | — | A value was pasted with the paste button. |
| `rendered` | `(HTMLElement[])` | The textarea rendered its `textParts`, with the tagged elements in order. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `prefix` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; }` | Content before the text inside the field, such as chips. Also shown while readonly. |
| `before` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; focused: boolean; }` | Content right before the text, in the same box as the input. |
| `toolbar` | `{ wrapSelection: (value: WrapSelection) => void; }` | Extra buttons in the textarea toolbar — `wrapSelection` applies a formatting to the selected text. Shows the toolbar on its own. |
| `after` | — | Content right after the text, in the same box as the input. |
| `suffix` | `{ loading: boolean; disabled: boolean; }` | Buttons after the clear, paste and copy buttons. `disabled` is also set by `disabledActions`. |
| `inner` | — | Content at the end of the field box, after the action buttons. |
| `right` | — | Content to the right of the field. |
| `bottom` | — | Content under the field, above the Save and Cancel buttons of an `async` input. |

<!-- @api-end -->

<!-- @api WInputAsync -->

### WInputAsync

```ts
import WInputAsync from 'eco-vue-js/dist/components/Input/WInputAsync.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `validate` | `ValidateFn \| ValidateFn[]` | — | Checks the value before it is saved. A returned error message is shown under the field and the value is not emitted. |
| `modelValue` | `(Type extends "number" ? number : string) \| null` | — | Field value — a `number` when `type` is `number`, otherwise a `string`. |
| `type` | `Type` | — | Native input type. `number` parses the value into a number. |
| `textarea` | `boolean` | — | Multi-line editor instead of a single-line input, with undo and redo. |
| `resize` | `boolean` | — | Lets the user drag the textarea's height. |
| `placeholder` | `string` | — | Hint shown while the field is empty. |
| `icon` | `SVGComponent` | — | Icon at the start of the field, highlighted while focused. |
| `size` | `number` | — | Native `size` attribute, which sets the input's minimum width in characters. |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `step` | `number` | — | Native `step` attribute for `type="number"`. |
| `min` | `number` | — | Native `min` attribute for `type="number"`. |
| `max` | `number` | — | Native `max` attribute for `type="number"`. |
| `name` | `string` | — | Native `name` attribute. |
| `autocomplete` | `string` | — | Native `autocomplete` attribute. |
| `autofocus` | `number \| boolean` | — | Focuses the field after mount, and again when the browser tab becomes active. A number sets the delay in ms (`0` focuses at once). Skipped while another input has focus. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `unclickable` | `boolean \| null` | `null` | Blocks typing and turns a click into a `focus` event, for fields that open a menu instead of taking text. |
| `disabledActions` | `boolean` | — | Disables the action buttons (clear, paste, copy) while keeping the input editable. |
| `loading` | `boolean` | — | Shows a spinner in the actions and blocks input. |
| `spellcheck` | `boolean` | — | Enables the browser's spell check. |
| `customBackspaceHandle` | `boolean` | — | Handles Backspace in code — removes the character or selection and emits the new value — instead of leaving it to the browser. |
| `textSecure` | `boolean` | — | Masks the value, with a button to reveal it, for secrets. A model value of `true` means a secret is set but not sent to the client, and shows a check mark instead. |
| `placeholderSecure` | `boolean` | — | Shows the secret-set check mark while the field is empty. |
| `allowClear` | `boolean` | — | Adds a button that clears the value. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `async` | `boolean` | — | Keeps edits local and emits them only when saved — on Enter or blur — instead of on every keystroke. |
| `debounce` | `number` | — | With `async`, also saves after this many ms without typing, showing a progress bar under the text. |
| `hideDebounce` | `boolean` | — | Hides the `debounce` progress bar. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |

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

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(((Type extends "number" ? number : string) & {}) \| undefined)` | The saved value — on Enter, blur, `debounce` or Save — once it passes `validate`. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | — | Content to the right of the field. |
| `prefix` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; }` | Content before the text inside the field, such as chips. Also shown while readonly. |
| `before` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; focused: boolean; }` | Content right before the text, in the same box as the input. |

<!-- @api-end -->

<!-- @api WInputSuggest -->

### WInputSuggest

```ts
import WInputSuggest from 'eco-vue-js/dist/components/Input/WInputSuggest.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |
| `modelValue` | `(Type extends "number" ? number : string) \| null` | — | Field value — a `number` when `type` is `number`, otherwise a `string`. |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `Type` | — | Native input type. `number` parses the value into a number. |
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
| `allowClear` | `boolean` | — | Adds a button that clears the value. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `async` | `boolean` | — | Keeps edits local and emits them only when saved — on Enter or blur — instead of on every keystroke. |
| `debounce` | `number` | — | With `async`, also saves after this many ms without typing, showing a progress bar under the text. |
| `hideDebounce` | `boolean` | — | Hides the `debounce` progress bar. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `horizontalAlign` | `HorizontalAlign` | `HorizontalAlign.FILL` | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
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

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `((Type extends "number" ? number : string) & {})` | The typed value. Not emitted while `loading`. |
| `keypress:enter` | `(KeyboardEvent)` | Enter without modifiers. |
| `keypress:up` | `(KeyboardEvent)` | Arrow Up without modifiers. |
| `keypress:down` | `(KeyboardEvent)` | Arrow Down without modifiers. |
| `keypress:delete` | `(KeyboardEvent)` | Backspace or Delete without modifiers. |
| `open` | — | The menu opened, on focus. |
| `close` | — | The menu closed. |
| `click:clear` | — | The clear button was clicked. |
| `focus` | `(FocusEvent \| undefined)` | The input got focus. On mobile, not emitted by the field that opens the bottom sheet. |
| `blur` | `(FocusEvent)` | The input lost focus. On mobile, not emitted by the field that opens the bottom sheet. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `toolbar` | `{ wrapSelection: (value: WrapSelection) => void; }` | Extra buttons in the textarea toolbar — `wrapSelection` applies a formatting to the selected text. Shows the toolbar on its own. |
| `prefix` | `{ unclickable?: boolean \| null \| undefined; }` | Content before the text inside the field, such as chips. `unclickable` is `true` for the field that opens the mobile bottom sheet. |
| `before` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; focused: boolean; }` | Content right before the text, in the same box as the input. |
| `right` | `{ unclickable?: boolean \| null \| undefined; }` | Content to the right of the field. `unclickable` is `true` for the field that opens the mobile bottom sheet. |
| `bottom` | — | Content under the field, after a `static` or `embedded` menu. |
| `content` | `{ focused: boolean; blur: () => void; focus: () => void; }` | Menu content. `focus` and `blur` move focus to and from the input, which opens and closes the menu. |

<!-- @api-end -->

<!-- @api WInputOptions -->

### WInputOptions

```ts
import WInputOptions from 'eco-vue-js/dist/components/Input/WInputOptions.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `Option[]` | **required** | Suggestions shown in the menu. Picking one sets the value and blurs the input. |
| `valueGetter` | `(option: Option) => (Type extends "number" ? number : string) \| null` | **required** | Value an option puts into the input. |
| `emptyStub` | `string` | — | Text shown when `options` is empty. Defaults to "No suggestion". |
| `optionComponent` | `Component<{ option: Option; selected?: boolean \| undefined; model?: boolean \| undefined; }>` | — | Renders an option in the menu. The `option` slot replaces it. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |
| `modelValue` | `(Type extends "number" ? number : string) \| null` | — | Field value — a `number` when `type` is `number`, otherwise a `string`. |
| `maxLength` | `number` | — | Cuts off input longer than this, and shows a `length / maxLength` counter under the field while it is focused. |
| `readonly` | `boolean` | — | Shows the value as text without an input. When unset, inherits the readonly state provided by a parent. |
| `type` | `Type` | — | Native input type. `number` parses the value into a number. |
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
| `allowClear` | `boolean` | — | Adds a button that clears the value. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `async` | `boolean` | — | Keeps edits local and emits them only when saved — on Enter or blur — instead of on every keystroke. |
| `debounce` | `number` | — | With `async`, also saves after this many ms without typing, showing a progress bar under the text. |
| `hideDebounce` | `boolean` | — | Hides the `debounce` progress bar. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
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

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `((Type extends "number" ? number : string) \| null)` | The typed value, or the value of a picked option. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | — | Content to the right of the field. |
| `option` | `{ option: Option; selected: boolean; model: boolean; }` | Content of an option in the menu. Replaces `optionComponent`. |

<!-- @api-end -->

<!-- @api WInputDate -->

### WInputDate

```ts
import WInputDate from 'eco-vue-js/dist/components/Input/WInputDate.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Date` | — | Selected date. Typed text is parsed into a date as it changes. |
| `minDate` | `Date` | — | Earliest selectable date. A typed date before it is replaced with it. |
| `maxDate` | `Date` | — | Latest selectable date. A typed date after it is replaced with it. |
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
| `allowClear` | `boolean` | — | Adds a button that clears the value. |
| `allowPaste` | `boolean` | — | Adds a button that pastes from the clipboard, replacing the value. |
| `hideInput` | `boolean` | — | Hides the text input, leaving only the `prefix` content. |
| `noWrap` | `boolean` | — | Keeps the `prefix` content on one line, scrolling sideways instead of wrapping. |
| `textTransparent` | `boolean` | — | Makes the typed text transparent while keeping the caret, for an overlay that draws the text itself. |
| `textParts` | `TextPart[]` | — | Textarea content as a list of strings and tagged parts, for highlighting parts of the text. |
| `rich` | `boolean` | — | Adds a formatting toolbar to the textarea. |
| `toolbarActions` | `ToolbarAction[]` | — | Custom buttons for the textarea toolbar. |
| `borderClass` | `string` | — | Border color classes, replacing the default gray. |
| `async` | `boolean` | — | Keeps edits local and emits them only when saved — on Enter or blur — instead of on every keystroke. |
| `debounce` | `number` | — | With `async`, also saves after this many ms without typing, showing a progress bar under the text. |
| `hideDebounce` | `boolean` | — | Hides the `debounce` progress bar. |
| `explicit` | `boolean` | — | With `async`, shows Save and Cancel buttons while there are unsaved edits. Always on for `textarea` and `textSecure`. |
| `mobileTitle` | `string` | — | Title for the mobile bottom sheet the menu opens in. Defaults to `title`. |
| `persist` | `boolean` | — | Keeps the menu open when the input loses focus. |
| `closeOnClear` | `boolean` | — | Closes the menu when the value is cleared. |
| `static` | `boolean` | — | Renders the menu content under the input instead of in a dropdown. |
| `hideToggle` | `boolean` | — | Hides the button that opens and closes the menu. |
| `horizontalAlign` | `HorizontalAlign` | `HorizontalAlign.RIGHT_INNER` | Horizontal placement relative to the parent. When it does not fit the viewport, the next placement in order is tried. |
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

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: Date \| undefined)` | The picked or typed date, clamped to `minDate` and `maxDate`. `undefined` when the text is cleared. Text that is not a date emits nothing. |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | Replaces the `title` text. |
| `subtitle` | — | Content between the title and the field. |
| `right` | `{ unclickable?: boolean \| null \| undefined; }` | Content to the right of the field. On mobile, `unclickable` is `true` for the field on the page and `false` for its copy in the bottom sheet. |

<!-- @api-end -->

<!-- @api WInputToolbarButton -->

### WInputToolbarButton

```ts
import WInputToolbarButton from 'eco-vue-js/dist/components/Input/WInputToolbarButton.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Text of the button, e.g. "H1". |
| `icon` | `SVGComponent` | — | Icon of the button. |
| `value` | `WrapSelection \| { title?: string \| undefined; icon?: SVGComponent \| undefined; value?: WrapSelection \| undefined; label?: string \| undefined; }[]` | — | Formatting applied to the selected text on click. A list turns the button into a group that opens its items on hover. |
| `tooltip` | `string` | — | Tooltip text. |
| `disabled` | `boolean` | — | Disables the button. |
| `label` | `string` | — | Name for screen readers. Defaults to `tooltip`, then `title`. |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `(index: number \| undefined)` | The button was clicked — with the item's index for a group, and `undefined` otherwise. |

<!-- @api-end -->
