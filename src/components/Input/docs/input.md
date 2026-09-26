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

- `title`, `description` and `errorMessage` render around the field. `mandatory` marks the title as required.
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
      mandatory
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

`WInputAsync` takes `validate` — one function or a list — that returns an error message or `undefined`. While the value is invalid, the error is shown and the model is not updated, so the parent only ever receives valid values.

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

  <p class="text-sm text-gray-500">
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

  <p class="text-sm text-gray-500">
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

## API

<!-- @api WInput -->

### WInput

```ts
import WInput from 'eco-vue-js/dist/components/Input/WInput.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `(Type extends "number" ? number : string) \| null` | — | — |
| `type` | `Type` | — | — |
| `textarea` | `boolean` | — | — |
| `resize` | `boolean` | — | — |
| `placeholder` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `size` | `number` | `10` | — |
| `maxLength` | `number` | — | — |
| `step` | `number` | — | — |
| `min` | `number` | — | — |
| `max` | `number` | — | — |
| `name` | `string` | — | — |
| `autocomplete` | `string` | `"off"` | — |
| `autofocus` | `number \| boolean` | — | — |
| `readonly` | `boolean` | — | — |
| `unclickable` | `boolean \| null` | `null` | — |
| `disabledActions` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `spellcheck` | `boolean` | — | — |
| `customBackspaceHandle` | `boolean` | — | — |
| `textSecure` | `boolean` | — | — |
| `placeholderSecure` | `boolean` | — | — |
| `allowClear` | `boolean` | — | — |
| `allowPaste` | `boolean` | — | — |
| `hideInput` | `boolean` | — | — |
| `noWrap` | `boolean` | — | — |
| `textTransparent` | `boolean` | — | — |
| `textParts` | `TextPart[]` | — | — |
| `rich` | `boolean` | — | — |
| `toolbarActions` | `ToolbarAction[]` | — | — |
| `borderClass` | `string` | — | — |
| `async` | `boolean` | — | — |
| `debounce` | `number` | — | — |
| `hideDebounce` | `boolean` | — | — |
| `explicit` | `boolean` | — | — |

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

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(((Type extends "number" ? number : string) & {}) \| undefined)` | — |
| `keypress:enter` | `(KeyboardEvent)` | — |
| `keypress:up` | `(KeyboardEvent)` | — |
| `keypress:down` | `(KeyboardEvent)` | — |
| `keypress:delete` | `(KeyboardEvent)` | — |
| `keypress:backspace` | `(KeyboardEvent)` | — |
| `click:clear` | — | — |
| `focus` | `(FocusEvent \| undefined)` | — |
| `blur` | `(FocusEvent)` | — |
| `click` | `(MouseEvent)` | — |
| `mousedown` | `(MouseEvent)` | — |
| `select:input` | `(Event)` | — |
| `paste` | — | — |
| `rendered` | `(HTMLElement[])` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | — |
| `subtitle` | — | — |
| `prefix` | — | — |
| `before` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; }` | — |
| `toolbar` | `{ wrapSelection: (value: WrapSelection) => void; }` | — |
| `after` | — | — |
| `suffix` | `{ loading: boolean; disabled: boolean; }` | — |
| `inner` | — | — |
| `right` | — | — |
| `bottom` | — | — |

<!-- @api-end -->

<!-- @api WInputAsync -->

### WInputAsync

```ts
import WInputAsync from 'eco-vue-js/dist/components/Input/WInputAsync.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `validate` | `ValidateFn \| ValidateFn[]` | — | — |
| `modelValue` | `(Type extends "number" ? number : string) \| null` | — | — |
| `type` | `Type` | — | — |
| `textarea` | `boolean` | — | — |
| `resize` | `boolean` | — | — |
| `placeholder` | `string` | — | — |
| `icon` | `SVGComponent` | — | — |
| `size` | `number` | — | — |
| `maxLength` | `number` | — | — |
| `step` | `number` | — | — |
| `min` | `number` | — | — |
| `max` | `number` | — | — |
| `name` | `string` | — | — |
| `autocomplete` | `string` | — | — |
| `autofocus` | `number \| boolean` | — | — |
| `readonly` | `boolean` | — | — |
| `unclickable` | `boolean \| null` | `null` | — |
| `disabledActions` | `boolean` | — | — |
| `loading` | `boolean` | — | — |
| `spellcheck` | `boolean` | — | — |
| `customBackspaceHandle` | `boolean` | — | — |
| `textSecure` | `boolean` | — | — |
| `placeholderSecure` | `boolean` | — | — |
| `allowClear` | `boolean` | — | — |
| `allowPaste` | `boolean` | — | — |
| `hideInput` | `boolean` | — | — |
| `noWrap` | `boolean` | — | — |
| `textTransparent` | `boolean` | — | — |
| `textParts` | `TextPart[]` | — | — |
| `rich` | `boolean` | — | — |
| `toolbarActions` | `ToolbarAction[]` | — | — |
| `borderClass` | `string` | — | — |
| `async` | `boolean` | — | — |
| `debounce` | `number` | — | — |
| `hideDebounce` | `boolean` | — | — |
| `explicit` | `boolean` | — | — |

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

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(((Type extends "number" ? number : string) & {}) \| undefined)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | — |
| `subtitle` | — | — |
| `right` | — | — |
| `prefix` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; }` | — |
| `before` | `{ modelValue: (Type extends "number" ? number : string) \| null \| undefined; focused: boolean; }` | — |

<!-- @api-end -->

<!-- @api WInputDate -->

### WInputDate

```ts
import WInputDate from 'eco-vue-js/dist/components/Input/WInputDate.vue'
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `Date` | — | — |
| `minDate` | `Date` | — | — |
| `maxDate` | `Date` | — | — |
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
| `allowClear` | `boolean` | — | — |
| `allowPaste` | `boolean` | — | — |
| `hideInput` | `boolean` | — | — |
| `noWrap` | `boolean` | — | — |
| `textTransparent` | `boolean` | — | — |
| `textParts` | `TextPart[]` | — | — |
| `rich` | `boolean` | — | — |
| `toolbarActions` | `ToolbarAction[]` | — | — |
| `borderClass` | `string` | — | — |
| `async` | `boolean` | — | — |
| `debounce` | `number` | — | — |
| `hideDebounce` | `boolean` | — | — |
| `explicit` | `boolean` | — | — |
| `mobileTitle` | `string` | — | — |
| `persist` | `boolean` | — | — |
| `closeOnClear` | `boolean` | — | — |
| `static` | `boolean` | — | — |
| `hideToggle` | `boolean` | — | — |
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

::: details Inherited from `src/components/Dropdown/types.ts` (4)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontalAlign` | `HorizontalAlign` | `HorizontalAlign.RIGHT_INNER` | — |
| `top` | `boolean` | — | — |
| `bottom` | `boolean` | — | — |
| `innerClass` | `string` | — | — |

:::

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:model-value` | `(value: Date \| undefined)` | — |

#### Slots

| Slot | Props | Description |
| --- | --- | --- |
| `title` | — | — |
| `subtitle` | — | — |
| `right` | `{ unclickable?: boolean \| null \| undefined; }` | — |

<!-- @api-end -->
